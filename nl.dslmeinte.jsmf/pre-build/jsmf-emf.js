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
			_eResource.contents.push(new EObject(this, null, null));
		});

		return _eResource;

		function EObject(initData, parent, containingFeature) {	/* analogous to org.eclipse.emf.ecore.EObject (or org.eclipse.emf.ecore.impl.EObjectImpl / DynamicEObjectImpl) */

			if( typeof(initData) !== 'object' ) throw new Error('EObject constructor called with non-Object initialisation data: ' + JSON.stringify(initData) );
			jsmf.util.checkClass(this);

			var className = initData['_class'];
			this.eClass = ePackage.classifiers[className];
			if( !this.eClass ) throw new Error("declared object's type '" + className + "' not defined in meta model");
			if( this.eClass['abstract'] ) throw new Error("class '" + className + "' is abstract and cannot be instantiated");

			log( "constructing an instance of '" + className + "' with initialisation data: " + JSON.stringify(initData) );

			this.eResource = _eResource;
			this.eContainer = parent;
			this.eContainingFeature = containingFeature;

			var _allFeatures = this.eClass.allFeatures();

			var validPropertyNames = [ "_class" ].concat(this.eClass.allAnnotations()).concat($.map(_allFeatures, function(value, key) { return key; }));
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
							case 'containment':	return createNestedObject(feature, value, function(_value, type) { return new EObject(_value, _self, feature); });
							case 'reference':	return createNestedObject(feature, value, function(_value, type) { return new EProxy(_value, type); });
						}
					})();
				} else {
					if( feature.lowerLimit > 0 ) throw new Error("no value given for required feature named '" + featureName + "'");
				}
				log("\t(set value of feature named '" + featureName + "')");

				// add getter & setter:
				var FeatureName = jsmf.util.toFirstUpper(featureName);	// TODO  sanitize feature name a bit more!
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
					// TODO  consider not allowing this type of shortcuts
					return [ object ];
				}
				return object;
			}

			this.eGet = function(featureArg) {
				var feature = (function() {
					if( typeof(featureArg) === 'string' )			return this.eClass.features[featureArg];
					if( featureArg instanceof jsmf.ecore.EFeature )	return featureArg;
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

			this.uri = function() {
				if( this.eContainer == null ) {
					if( !this.name ) throw new Error("cannot compute URI for object due to missing name");
						// TODO  switch to a count-based system for name-less things
					return '/' + this.name;
				}
				return this.eContainer.uri() + '.' + this.eContainingFeature.name + '/' + this.name;
			};

			// TODO  add convenience function for traversal and such

			// simple, switchable debugging (remove later):
			function log(message) {
				if( false ) {
					console.log(message);
				}
			}

		}

		function EProxy(_uriString, type) {

			this.uriString = _uriString;
			this.uri = jsmf.resolver.createUri(_uriString);
			this.type = type;

			this.resolve = function() {
				return this.uri.resolveInEResource(_eResource);
			};

			this.isEProxy = function() {
				return true;
			};

		}

	};

	function EResource(ePackage) {

		this.ePackage = ePackage;
		this.contents = [];

		/**
		 * Converts this EResource to JSON, with references in the correct textual format - see below.
		 */
		this.toJSON = function() {

			var json = [];

			$(this.contents).each(function(i) {
				json.push(convertObject(this));
			});

			return json;

			function convertObject(eObject) {
				if( eObject == null ) {
					return null;
				}

				var json = {};
				json['_class'] = eObject.eClass.name;

				$.map(eObject.eClass.allFeatures(), function(feature, featureName) {
					var convertedValue = convertValue(eObject[featureName], feature);
					if( convertedValue != null ) {
						json[featureName] = convertedValue;
					}
				});

				return json;

				function convertValue(value, feature) {
					if( feature.manyValued() ) {
						var json = [];
						$(value).each(function(i) {
							json.push(convertSingleValue(this, feature));
						});
						if( json.length > 0 ) {
							return json;
						}
						return null;
					}

					return convertSingleValue(value, feature);
				}

				function convertSingleValue(value, feature) {
					switch(feature.kind) {
						case 'attribute':	return value;
						case 'containment':	return convertObject(value);
						case 'reference':	{
							if( value == null )		return null;
							if( value.isEProxy )	return value.uriString;
							return value.uri();
						}
					}
				}

			}

		};

	}


});

