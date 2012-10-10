/*
 * This corresponds to the Ecore part of EMF.
 * (Also: ~ re-implementation of metamodel_provider.js)
 * 
 * (c) 2012 Meinte Boersma
 */


jsmf.meta = new (function() {

	"use strict";

	/**
	 * An EPackage represents a meta model.
	 * <p>
	 * Note that I don't care for meta-circularity all that much, so it's separate from EObject etc.
	 * 
	 * @param metaModel - a "standard" representation of the meta model (i.e., Concrete's representation for it - but more restricted)
	 */
	this.createMetaModelFromJSON = function(metaModelJSON) {

		if( !$.isArray(metaModelJSON) ) throw new Error("meta model JSON is not an array");

		var metaModel = new MetaModel();

		$(metaModelJSON).each(function(index) {
			if( typeof(this) !== 'object' ) throw new Error('non-Object encountered within meta model JSON array: index=' + index);
			jsmf.util.checkName(this, "classifier name is empty");
			if( metaModel.classifiers[this.name] ) throw new Error("classifier name '" + this.name + "' not unique");
			metaModel.classifiers[this.name] = createClassifier(this);
		});
		// post condition: all names in metaModelJSON are non-empty strings, or ("fatal") Error would have been thrown

		if( !metaModel.classifiers['String'] ) {
			metaModel.classifiers['String'] = new Datatype( { name: 'String' } );
		}
		// TODO  consider just adding (by reference to singletons) all standard data types, including some behavior (=> do this in MetaModel constructor)

		$.map(metaModel.classifiers, function(eClassifier, name) {
			if( eClassifier instanceof Class) {
				eClassifier.resolveTypes(metaModel);
			}
		});

		return metaModel;

	};

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
		jsmf.util.checkClass(initData);
		var classifier = (function() {
			switch( initData._class ) {
				case 'Datatype':	return new Datatype(initData);
				case 'Enum':		return new Enum(initData);
				case 'Class':		return new Class(initData);
			}
			throw new Error("illegal classifier meta type: " + initData._class);
		})();
		classifier.name = initData.name;
		return classifier;
	}

	function Class(initData) {

		jsmf.util.checkProperties(initData, [ "_class", "name", "features", "superTypes", "abstract", "annotations" ]);

		this['abstract'] = !!initData['abstract'];	// note: 'abstract' is a reserved keyword in JS, and e.g. Safari-iPad parses it as such
		this.superTypes = (function(types) {
			if( !types ) return [];
			if( types.length === 0 ) return [];
			if( jsmf.util.isNonDegenerateStringArray(types) ) {
				return types;
			}
			throw new Error("superTypes spec. of class " + initData.name + " is not an array of names");
		})(initData.superTypes);


		if( initData.annotations ) {
			if( !jsmf.util.isNonDegenerateStringArray(initData.annotations) ) {
				throw new Error("annotations must be a non-empty array of non-empty strings");
			}
			this.annotations = initData.annotations;
		} else {
			this.annotations = [];
		}

		this.features = {};

		var _self = this;	// for use in closures, to be able to access public features (can't do that through `this.`)
		if( initData.features ) {
			if( !$.isArray(initData.features) ) throw new Error('feature spec. is not an array (of features) in class: ' + initData.name);
			$(initData.features).each(function(index) {
				jsmf.util.checkName(this, "feature name is empty");
				if( _self.features[this.name] ) throw new Error("feature name '" + this.name + "' is not unique in class: " + initData.name);
				_self.features[this.name] = createFeature(this, _self);
			});
		}

		var typesResolved = false;
		this.resolveTypes = function(metaModel) {
			if( typesResolved ) throw new Error('Class#resolve called twice');

			// resolve super types:
			var resolvedSuperTypes = [];
			$(this.superTypes).each(function(index) {
				var typeName = this;
				var refType = metaModel.classifiers[typeName];
				if( !refType ) throw new Error("could not resolve super type '" + typeName + "' of " + _self.name);
				if( !(refType instanceof Class) ) throw new Error("super type '" + typeName + "' is not a class");
				resolvedSuperTypes.push(refType);
			});
			this.superTypes = resolvedSuperTypes;

			// resolve type references in Feature.type:
			$.map(this.features, function(feature, featureName) {
				var refType = metaModel.classifiers[feature.type];
				if( !refType ) throw new Error("could not resolve target type '" + feature.type + "' in " + this.name + "." + featureName);
				feature.type = refType;
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
					if( _allFeatures[featureName] ) throw new Error("duplicate feature named '" + featureName + "' in classes " + _self.name + " and " + eClass.name);
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
			throw new Error('invalid feature argument: ' + JSON.stringify(featureArg));
		};

		this.checkAnnotation = function(annotationName) {
			if( typeof(annotationArg) === 'string' ) return this.allAnnotations()[annotationName];
			throw new Error('invalid annotation argument: ' + JSON.stringify(annotationName));
		};

	}


	function Datatype(initData) {
		if( !$.inArray(this.name, [ "String", "Integer", "Float", "Boolean" ]) ) {
			throw new Error("illegal datatype name: " + initData.name + " (datatype must be named one of [String, Integer, Float, Boolean])");
		}
		jsmf.util.checkProperties(initData, [ "_class", "name" ]);
	}


	function Enum(initData) {
		jsmf.util.checkProperties(initData, [ "_class", "name", "literals" ]);

		if( !jsmf.util.isNonDegenerateStringArray(initData.literals) ) {
			throw new Error("literals of an enumeration '" + initData.name + "' is not an (non-degenerate) array of strings");
		}

		this.literals = initData.literals;
	}


	/*
	 * +------------------+
	 * | feature creation |
	 * +------------------+
	 */

	function createFeature(initData, eClass) {


		/*
		 * The following are sub types of Feature.
		 * Note that these types already contain knowledge on how to deal with instances.
		 */

		function Attribute() {
			this.get = function(value)		{ return value; };
			this.toJSON = function(value)	{ return value; };
		}
		Attribute.prototype = new jsmf.meta.Feature();

		function Reference() {
			this.get = function(setting) {
				if( setting instanceof jsmf.model.MProxy ) {
					return setting.resolve();
				}
				return setting;
			};
			this.toJSON = function(value) {
				if( value === undefined ) return null;
				return( value instanceof jsmf.model.MProxy ? value.uriString : value.uri() );
			};
		}
		Reference.prototype = new jsmf.meta.Feature();

		function Containment() {
			this.get = function(value)		{ return value; };
			this.toJSON = function(value)	{ return( value === undefined ? null : value.toJSON() ); };	// FIXME  doesn't take many-valued features into account
		}
		Containment.prototype = new jsmf.meta.Feature();


		jsmf.util.checkName(initData, "feature name is empty in class ' " + eClass.name + "'");
		jsmf.util.checkNonEmptyStringAttribute(initData, 'kind', "(meta_)kind attribute not defined");
		jsmf.util.checkProperties(initData, [ "_class", "name", "kind", "type", "lowerLimit", "upperLimit" ]);

		initData.kind = initData.kind || "attribute";
		var feature = (function(kind) {
				switch( kind ) {
					case "attribute":	return new Attribute();
					case "containment":	return new Containment();
					case "reference":	return new Reference();
			}
			throw new Error("illegal kind type '" + kind + "' for feature " + eClass.name + "." + initData.name);
		})(initData.kind);

		feature.kind = initData.kind;	// (has been checked now)

		feature.name = initData.name;
		feature.containingClass = eClass;
		feature.type = initData.type;	// overwritten later by true object reference

		feature.lowerLimit = initData.lowerLimit || 0;
		feature.lowerBound = feature.lowerLimit;	// duplicate to comply with Ecore
		feature.upperLimit = initData.upperLimit || ( initData.kind === "containment" ? -1 : 1 );
		feature.upperBound = feature.upperLimit;	// duplicate to comply with Ecore

		return feature;

	}

	this.Feature = function() {

		this.isNameFeature = function() {
			return(
					   this.name === 'name'
					&& this.kind === 'attribute'
					&& this.type.name === 'String'
					&& this.upperLimit === 1
				);
		};

		this.manyValued = function() {
			return( this.upperLimit != 1 );
		};

		this.get = function(value) {
			throw new Error("#get(value) not implemented!");
		};

		this.toJSON = function(value) {
			throw new Error("#toJSON(value) not implemented!");
		};

	};

})();

