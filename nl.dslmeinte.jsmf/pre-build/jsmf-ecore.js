/*
 * This corresponds to the Ecore part of EMF.
 * (Also: ~ re-implementation of metamodel_provider.js)
 * 
 * (c) 2012 Meinte Boersma
 */


jsmf.ecore = new (function() {

	/**
	 * An EPackage represents a meta model.
	 * <p>
	 * Note that I don't care for meta-circularity all that much, so it's separate from EObject etc.
	 * 
	 * @param metaModel - a "standard" representation of the meta model (i.e., the Concrete's representation for it)
	 */
	this.createEPackageFromConcrete = function(metaModelJSON) {

		if( !$.isArray(metaModelJSON) ) throw new Error("meta model JSON is not an array");

		var ePackage = new EPackage();

		$(metaModelJSON).each(function(index) {
			if( typeof(this) !== 'object' ) throw new Error('non-Object encountered within meta model JSON array: index=' + index);
			jsmf.util.checkName(this, "classifier name is empty");
			if( ePackage.classifiers[this.name] ) throw new Error("classifier name '" + this.name + "' not unique");
			ePackage.classifiers[this.name] = createEClassifier(this);
		});
		// post condition: all names in metaModelJSON are non-empty strings, or ("fatal") Error would have been thrown

		if( !ePackage.classifiers['String'] ) {
			ePackage.classifiers['String'] = new EDatatype( { name: 'String' } );
		}

		// TODO  re-cast the following using jQuery's each (or something)

		$.map(ePackage.classifiers, function(classifier, classifierName) {
			if( classifier instanceof EClass ) {
				classifier.resolve(ePackage);
			}
		});

		return ePackage;

	};

	function EPackage() {
		this.classifiers = {};
	}


	/*
	 * +---------------------+
	 * | classifier creation |
	 * +---------------------+
	 */

	function createEClassifier(initData) {
		jsmf.util.checkName(initData, "classifier name is empty");
		jsmf.util.checkClass(initData);
		var classifier = (function() {
			switch( initData["_class"] ) {
				case 'Datatype':	return new EDatatype(initData);
				case 'Enum':		return new EEnum(initData);
				case 'Class':		return new EClass(initData);
			}
			throw new Error("illegal classifier meta type: " + initData["_class"]);
		})();
		classifier.name = initData.name;
		return classifier;
	}

	function EClass(initData) {

		checkAttributeNames(initData, ["features", "superTypes", "abstract"]);

		this['abstract'] = !!initData['abstract'];	// note: 'abstract' is a reserved keyword in JS, and e.g. Safari-iPad parses it as such
		this.superTypes = (function(types) {
			if( types == undefined ) return [];
			if( !$.isArray(types) && typeof(types) === 'string' ) {
				return [ types ];
			}
			if( types.length == 0 ) return [];
			if( !jsmf.util.isNonDegenerateStringArray(types) ) {
				return types;
			}
			throw new Error("superTypes spec. of class " + initData.name + " is not an array of names");
		})(initData.superTypes);

		this.features = {};

		var self = this;	// for use in closures, to be able to access public features (can't do that through `this.`)

		if( initData.features != null && $.isArray(initData.features) ) {
			$(initData.features).each(function(index) {
				jsmf.util.checkName(this, "feature name is empty");
				if( self.features[this.name] ) throw new Error("feature name '" + this.name + "' is not unique in class: " + initData.name);
				self.features[this.name] = createEFeature(this, self);
			});
		}

		var resolved = false;

		this.resolve = function(ePackage) {
			if( resolved ) throw new Error('EClass#resolve called twice');
			var resolvedSuperTypes = [];
			for( var index in this.superTypes ) {
				var typeName = this.superTypes[index];
				var refType = ePackage.classifiers[typeName];
				if( refType == undefined ) throw new Error("could not resolve super type '" + typeName + "' of " + this.name);
				if( !(refType instanceof EClass) ) throw new Error("super type '" + typeName + "' is not a class");
				resolvedSuperTypes.push(refType);
			}
			this.superTypes = resolvedSuperTypes;
			$.map(this.features, function(feature, featureName) {
				var refType = ePackage.classifiers[feature.type];
				if( refType == undefined ) throw new Error("could not resolve target type '" + feature.type + "' in " + this.name + "." + featureName);
				feature.type = refType;
			});
			resolved = true;
		};

	}


	function EDatatype(initData) {

		if( !$.inArray(this.name, ["String", "Integer", "Float", "Boolean"]) ) {
			throw new Error("illegal datatype name: " + initData.name + " (datatype must be named one of [String, Integer, Float, Boolean])");
		}

		checkAttributeNames(initData);
	}


	function EEnum(initData) {
		checkAttributeNames(initData, ["literals"]);

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

	function createEFeature(initData, eClass) {
		jsmf.util.checkName(initData, "feature name is empty in class ' " + eClass.name + "'");
		jsmf.util.checkNonEmptyStringAttribute(initData, 'kind', "(meta_)kind attribute not defined");
		checkAttributeNames(initData, ["kind", "type", "lowerLimit", "upperLimit"]);

		var feature = (function(kind) {
				switch( kind ) {
				case "attribute":	return new EAttribute(initData);
				case "containment":	return new EReference(initData, true);
				case "reference":	return new EReference(initData, false);
			}
			throw new Error("illegal kind type '" + kind + "' for feature " + eClass.name + "." + initData.name);
		})(initData.kind || "attribute");

		feature.name = initData.name;
		feature.containingEClass = eClass;
		feature.type = initData.type;	// overwritten later by true object reference
		// TODO  consider moving these to private members to encapsulate differences between Concrete and Ecore representation (lowerBound vs. lowerLimit, etc.)
		feature.lowerLimit = initData.lowerLimit || 0;
		feature.upperLimit = initData.upperLimit || ( initData.kind === "containment" ? -1 : 1 );

		return feature;
	}

	function EAttribute(initData) {
		// (nothing to add)
	}

	function EReference(initData, containment) {
		this.containment = containment;
	}


	/*
	 * +---------------+
	 * | helper method |
	 * +---------------+
	 */

	function checkAttributeNames(initData, nonBaseAttributeNames) {
		var validAttributeNames = [ "_class", "name", "documentation" ];

		if( nonBaseAttributeNames != undefined ) {
			if( !jsmf.util.isNonDegenerateStringArray(nonBaseAttributeNames) ) {
				throw new Error('illegal 2nd argument nonBaseAttributeNames: must be a non-empty array of non-empty string');
			}
			validAttributesNames = validAttributeNames.concat(nonBaseAttributeNames);
		}

		for( var attributeName in initData ) {
			if( !$.inArray(attributeName, validAttributeNames) < 0 ) {
				throw new Error("illegal attribute named '" + attributeName + "' in meta object '" + this.name + "'");
			}
		}
	}

})();

