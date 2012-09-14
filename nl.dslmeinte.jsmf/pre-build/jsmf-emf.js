/*
 * This corresponds to the pure/base part of EMF.
 * 
 * (c) 2012 Meinte Boersma
 */


jsmf.emf = new (function() {

	this.createEResource = function(modelJSON, ePackage) {	/* (somewhat) analogous to org.eclipse.emf.ecore.resource.Resource (or rather: org.eclipse.emf.ecore.resource.impl.ResourceImpl) */

		var eResource = new EResource(ePackage);

		if( !$.isArray(modelJSON) ) throw new Error('model JSON is not an array of objects');
		$(modelJSON).each(function(index) {
			if( typeof(this) !== 'object' ) throw new Error('non-Object encountered within model JSON array: index=' + index);
			eResource.contents.push(new EObject(this));
		});

		// TODO  resolve references

		return eResource;

		function EObject(initData) {	/* analogous to org.eclipse.emf.ecore.EObject (or org.eclipse.emf.ecore.impl.EObjectImpl / DynamicEObjectImpl) */

			if( typeof(initData) !== 'object' ) throw new Error('EObject constructor called with non-Object initialisation data: ' + JSON.stringify(initData) );
			jsmf.util.checkClass(this);

			var className = initData['_class'];
			this.eClass = ePackage.classifiers[className];
			if( !this.eClass ) throw new Error("declared object's type '" + className + "' not defined in meta model");
			if( this.eClass['abstract'] ) throw new Error("class '" + className + "' is abstract and cannot be instantiated");

			log( "constructing an instance of '" + className + "' with initialisation data: " + JSON.stringify(initData) );

			var _allFeatures = this.eClass.allFeatures();

			var validPropertyNames = [ "_class" ].concat(this.eClass.annotations).concat($.map(_allFeatures, function(k, v) { return k; }));
			jsmf.util.checkProperties(initData, validPropertyNames);

			var _self = this;	// for use in closures, to be able to access public features (can't do that through `this.`)

			// traverse values/settings of features:
			$.map(_allFeatures, function(feature, featureName) {
				var value = initData[featureName];
				log("\tsetting value of feature named '" + featureName + "' with value: " + JSON.stringify(value));
				if( value ) {
					_self[featureName] = (function() {
						switch(feature.kind) {
							case 'attribute':	return value;
							case 'containment':	return createNestedObject(feature, value, function(_value, type) { return new EObject(_value); });
							case 'reference':	return createNestedObject(feature, value, function(_value, type) { return new EProxy(_value, type); });
						}
					})();
				} else {
					if( feature.lowerLimit > 0 ) throw new Error("no value given for required feature named '" + featureName + "'");
				}
				log("\t(set value of feature named '" + featureName + "')");
			});

			function createNestedObject(feature, value, creationFunc) {
				if( $.isArray(value) ) {
					if( !feature.manyValued() ) throw new Error('cannot load an array into the single-valued feature ' + feature.containingEClass.name + '#' + feature.name);
					return $.map(value, function(nestedValue, index) {
						return creationFunc.apply(this, [ nestedValue, feature.type ]);
					});
				}
				var object = creationFunc.apply(this, [ value, feature.type ]);
				if( feature.manyValued() ) {
					return [ object ];
				}
				return object;
			}

			this.eGet = function(feature) {
				if( typeof(feature) === 'string' ) {
					return this[feature];
				}
				if( feature instanceof EFeature ) {
					return this[feature.name];
				}
				throw new Error('invalid feature argument to eGet');
			};

			this.eSet = function(feature, value) {
				if( typeof(feature) === 'string' ) {
					this[feature] = value;
				}
				if( feature instanceof EFeature ) {
					this[feature.name] = value;
				}
				throw new Error('invalid feature argument to eGet');
			};

			// TODO  add convenience function for traversal and such

			// simple, switchable debugging (remove later):
			function log(message) {
				if( false ) {
					console.log(message);
				}
			}
		}

		function EProxy(value, type) {
			this.value = value;
			this.type = type;
		}

	};

	function EResource(ePackage) {
		this.ePackage = ePackage;
		this.contents = [];
	}


});

