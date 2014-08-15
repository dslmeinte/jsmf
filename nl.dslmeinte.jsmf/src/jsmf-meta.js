/*
 * This corresponds to the Ecore part of EMF.
 * (Also: ~ re-implementation of metamodel_provider.js)
 * 
 * (c) 2012 Meinte Boersma
 */

/*global $:false, jsmf:false */
/*jshint sub:true */
jsmf.meta = function() {

	"use strict";	// annotation for ECMAScript5

	/**
	 * A MetaModel represents a meta model.
	 * <p>
	 * Note that I don't care for meta-circularity all that much, so it's separate from EObject etc.
	 * 
	 * @param metaModel - a "standard" JSON representation of the meta model
	 */
	function createMetaModelFromJSON(metaModelJSON) {

		if( !$.isArray(metaModelJSON) ) throw "meta model JSON is not an array";

		var metaModel = new MetaModel();

		$(metaModelJSON).each(function(index) {
			if( typeof(this) !== 'object' ) throw 'non-Object encountered within meta model JSON array: index=' + index;
			jsmf.util.checkName(this, "classifier name is empty");
			if( metaModel.classifiers[this.name] ) throw "classifier name '" + this.name + "' not unique";
			metaModel.classifiers[this.name] = createClassifier(this);
		});
		// post condition: all names in metaModelJSON are non-empty strings, or ("fatal") Error would have been thrown

		$.map(metaModel.classifiers, function(eClassifier, name) {
			if( eClassifier instanceof Class) {
				eClassifier.resolveTypes(metaModel);
			}
		});

		return metaModel;

	}

	function MetaModel() {
		this.classifiers = {};
	}


	/*
	 * +---------------------+
	 * | classifier creation |
	 * +---------------------+
	 */

	function createClassifier(initData) {
		jsmf.util.checkName(initData, "classifier name is empty");
		jsmf.util.checkMetaType(initData);
		var classifier = (function() {
			switch( initData.metaMetaType ) {
				case 'Datatype':	return new Datatype(initData);
				case 'Enum':		return new Enum(initData);
				case 'Class':		return new Class(initData);
			}
			throw "illegal classifier meta meta type: " + initData.metaMetaType;
		})();
		classifier.name = initData.name;
		return classifier;
	}

	function Class(initData) {

		jsmf.util.checkProperties(initData, [ "metaMetaType", "name", "features", "superTypes", "abstract", "annotations" ]);

		this['abstract'] = !!initData['abstract'];	// note: 'abstract' is a reserved keyword in JS, and e.g. Safari-iPad parses it as such
		this.superTypes = (function(types) {
			if( !types ) return [];
			if( types.length === 0 ) return [];
			if( jsmf.util.isNonDegenerateStringArray(types) ) {
				return types;
			}
			throw "superTypes spec. of class " + initData.name + " is not an array of names";
		})(initData.superTypes);

		if( initData.annotations ) {
			if( !jsmf.util.isNonDegenerateStringArray(initData.annotations) ) {
				throw "annotations must be a non-empty array of non-empty strings";
			}
			this.annotations = initData.annotations;
		} else {
			this.annotations = [];
		}

		this.features = {};

		var _self = this;	// for use in closures, to be able to access public features (can't do that through `this.`)
		if( initData.features ) {
			if( !$.isArray(initData.features) ) throw 'feature spec. is not an array (of features in class: ' + initData.name;
			$(initData.features).each(function(index) {
				jsmf.util.checkName(this, "feature name is empty");
				if( _self.features[this.name] ) throw "feature name '" + this.name + "' is not unique in class: " + initData.name;
				_self.features[this.name] = createFeature(this, _self);
			});
		}

		var typesResolved = false;
		this.resolveTypes = function(metaModel) {
			if( typesResolved ) throw 'Class#resolve called twice';

			// resolve super types:
			var resolvedSuperTypes = [];
			$(this.superTypes).each(function(index) {
				var typeName = this;
				var refType = metaModel.classifiers[typeName];
				if( !refType ) throw "could not resolve super type '" + typeName + "' of " + _self.name;
				if( !(refType instanceof Class) ) throw "super type '" + typeName + "' is not a class";
				resolvedSuperTypes.push(refType);
			});
			this.superTypes = resolvedSuperTypes;

			// resolve type references in Feature.type:
			$.map(this.features, function(feature, featureName) {
				var refType = metaModel.classifiers[feature.type];
				if( refType ) {
					feature.type = refType;	// (the string value is overwritten by an actual object reference)
				}
			});

			typesResolved = true;
		};

		/**
		 * @returns A <em>dictionary</em> of all features of this Class, indexed by their (unqualified) name.
		 */
		this.allFeatures = function() {
			var _allFeatures = {};

			// copy own features:
			$.map(this.features, function(feature, featureName) {
				_allFeatures[featureName] = feature;
			});

			$(this.superTypes).each(function() {
				var eClass = this;
				$.map(eClass.allFeatures(), function(feature, featureName) {
					if( _allFeatures[featureName] ) throw "duplicate feature named '" + featureName + "' in classes " + _self.name + " and " + eClass.name;
					_allFeatures[featureName] = feature;
				});
			});

			return _allFeatures;
		};

		this.allAnnotations = function() {
			var _allAnnotations = [];

			_allAnnotations = _allAnnotations.concat(this.annotations);

			$(this.superTypes).each(function() {
				_allAnnotations = _allAnnotations.concat(this.allAnnotations());
			});

			return _allAnnotations;
		};

		this.getFeature = function(featureArg) {
			if( typeof(featureArg) === 'string' )			return this.allFeatures()[featureArg];
			if( featureArg instanceof jsmf.meta.Feature )	return featureArg;
			throw 'invalid feature argument: ' + JSON.stringify(featureArg);
		};

		this.checkAnnotation = function(annotationName) {
			if( typeof(annotationName) !== 'string' ) {
				throw 'invalid annotation argument: ' + JSON.stringify(annotationName);
			}
			if( !$.inArray(this.allAnnotations(), annotationName) ) {
				throw "class " + this.name + " doesn't have an annotation named '" + annotationName + "'";
			}
		};

	}


	function Enum(initData) {
		jsmf.util.checkProperties(initData, [ "metaMetaType", "name", "literals" ]);

		if( !jsmf.util.isNonDegenerateStringArray(initData.literals) ) {
			throw "literals of an enumeration '" + initData.name + "' is not an (non-degenerate array of strings";
		}

		this.literals = initData.literals;
	}


	function Datatype(initData) {
		jsmf.util.checkProperties(initData, [ "metaMetaType", "name" ]);
	}


	/*
	 * +------------------+
	 * | feature creation |
	 * +------------------+
	 */

	function createFeature(initData, metaType) {

		jsmf.util.checkName(initData, "feature name is empty in meta type ' " + metaType.name + "'");
		jsmf.util.checkNonEmptyStringAttribute(initData, 'kind', "(meta_)kind attribute not defined");
		jsmf.util.checkProperties(initData, [ "name", "kind", "type", "required", "manyValued", "annotations" ]);
		jsmf.util.isStringArrayOrNothing(initData.annotations);

		var feature = new jsmf.meta.Feature();
		var kind = initData.kind || "attribute";
		if( $.inArray(kind, [ "attribute", "containment", "reference" ]) < 0 ) {
			throw "given feature kind is invalid: " + kind;
		}
		feature.kind = kind;

		feature.name = initData.name;
		feature.containingClass = metaType;
		feature.type = initData.type;	// overwritten later by true object reference
		feature.required = ( initData.required !== undefined ) ? initData.required : false;
		feature.manyValued = ( initData.manyValued !== undefined ) ? initData.manyValued : ( initData.kind === "containment" );
			// TODO  come up with better defaulting for previous two lines
		feature.annotations = initData.annotations || [];

		return feature;

	}

	function Feature() {

		/*jshint smarttabs:true, laxbreak:true */
		this.isNameFeature = function() {
			return(
					   this.name === 'name'
					&& this.kind === 'attribute'
					&& this.type.name === 'String'
					&& !this.manyValued
				);
		};
		/*jshint smarttabs:false, laxbreak:false */

		this.toString = function() {
			return( this.containingClass.name + "." + this.name );
		};

		this.checkAnnotation = function(annotationName) {
			if( typeof(annotationName) !== 'string' ) {
				throw 'invalid annotation argument: ' + JSON.stringify(annotationName);
			}
			if( !$.inArray(this.annotations, annotationName) ) {
				throw "feature " + this.toString( + " doesn't have an annotation named '" + annotationName + "'");
			}
		};

	}

	return {
		'createMetaModelFromJSON':	createMetaModelFromJSON,
		'Feature':					Feature
	};

}();

