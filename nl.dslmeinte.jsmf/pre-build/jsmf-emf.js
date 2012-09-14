/*
 * This corresponds to the pure/base part of EMF.
 * 
 * (c) 2012 Meinte Boersma
 */


jsmf.emf = new (function() {

	this.createEResource = function(modelJSON, ePackage) {	/* (somewhat) analogous to org.eclipse.emf.ecore.resource.Resource (or rather: org.eclipse.emf.ecore.resource.impl.ResourceImpl) */

		var _eResource = new EResource(ePackage);	// (have to use _prefix to soothe JS plug-in)

		if( !$.isArray(modelJSON) ) throw new Error('model JSON is not an array of objects');
		$(modelJSON).each(function(index) {
			if( typeof(this) !== 'object' ) throw new Error('non-Object encountered within model JSON array: index=' + index);
			_eResource.contents.push(new EObject(this));
		});

		// TODO  resolve references

		return _eResource;

		function EObject(initData, parent) {	/* analogous to org.eclipse.emf.ecore.EObject (or org.eclipse.emf.ecore.impl.EObjectImpl / DynamicEObjectImpl) */

			if( typeof(initData) !== 'object' ) throw new Error('EObject constructor called with non-Object initialisation data: ' + JSON.stringify(initData) );
			jsmf.util.checkClass(this);

			var className = initData['_class'];
			this.eClass = ePackage.classifiers[className];
			if( !this.eClass ) throw new Error("declared object's type '" + className + "' not defined in meta model");
			if( this.eClass['abstract'] ) throw new Error("class '" + className + "' is abstract and cannot be instantiated");

			log( "constructing an instance of '" + className + "' with initialisation data: " + JSON.stringify(initData) );

			this.eResource = _eResource;
			this.eContainer = parent;

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
							case 'containment':	return createNestedObject(feature, value, function(_value, type) { return new EObject(_value, this); });
							case 'reference':	return createNestedObject(feature, value, function(_value, type) { return new EProxy(_value, type); });
						}
					})();
				} else {
					if( feature.lowerLimit > 0 ) throw new Error("no value given for required feature named '" + featureName + "'");
				}
				log("\t(set value of feature named '" + featureName + "')");

				// add getter & setter:
				var FeatureName = jsmf.util.toFirstUpper(featureName);
				_self['get' + FeatureName] = function() {
					return this.eGet(feature);
				};
				_self['set' + FeatureName] = function(_value) {
					this.eSet(feature, _value);
				};
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

			this.eGet = function(featureArg) {
				var feature = (function() {
					if( typeof(featureArg) === 'string' )					return this.eClass.features[featureArg];
					if( featureArg.isEFeature && featureArg.isEFeature() )	return featureArg;
					throw new Error('invalid feature argument to eGet: ' + JSON.stringify(featureArg));
				})(this);
				var value = this[feature.name];
				switch(feature.kind) {
					case 'attribute':	return value;
					case 'containment':	return value;
					case 'reference':	{
						var target = value.resolve();
						this[feature.name] = target;
						return target;
					}
				}
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

		/**
		 * Converts this EResource to JSON, with references in the correct textual format - see below.
		 */
		this.toJSON = function() {
			// TODO  implement!
//			var runningFragment = '/';
		};

		/**
		 * {code value} is a string in the format
		 * 		"/id1(.feature1)?/id2(.feature2)?/.../id$n$"
		 * indicating the path from the EResource's root to the target.
		 * (feature$n$ is missing since we don't descend into a feature anymore)
		 * All features are optional, since we can just traverse all (many-valued?)
		 * features of containment type. This is a nod to the current Concrete format -
		 * in general, I'd like to make the features required.
		 * 
		 * Note: we need a generic format (such as this one) or we need to implement
		 * custom resolution for every EPackage - which isn't useful on the M2 level,
		 * only on the level of the actual, concrete syntax of the language (== M0 + behavior).
		 */
		function EProxy(value, type) {

			this.value = value;
			this.type = type;

			this.resolve = function() {
				var fragments = value.split('/').slice(1);
				var count = fragments.length;

				var searchListOrObject = _eResource.contents;

				for( var index = 0; index < count; index++ ) {
					searchListOrObject = findIn(fragments[index], searchListOrObject);
					if( searchListOrObject == null ) throw new Error('could not resolve reference to object of type ' + type.name + ', path=' + value + ', index=' + index + ', fragment=' + fragments[index]);
				}

				return searchListOrObject;

				function findIn(fragment, list) {
					// TODO  implement!
				}

			};

		}

	};

	function EResource(ePackage) {
		this.ePackage = ePackage;
		this.contents = [];
	}


});

