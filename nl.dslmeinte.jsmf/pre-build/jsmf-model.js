/*
 * This corresponds to the pure/base part of EMF.
 * 
 * (c) 2012 Meinte Boersma
 */


jsmf.model = new (function() {

	this.createResource = function(modelJSON, metaModel) {	/* (somewhat) analogous to org.eclipse.emf.ecore.resource.Resource (or rather: org.eclipse.emf.ecore.resource.impl.ResourceImpl) */

		var _resource = new Resource(metaModel);	// (have to use _prefix to soothe JS plug-in)

		if( !$.isArray(modelJSON) ) throw new Error('model JSON is not an array of objects');
		$(modelJSON).each(function(index) {
			if( typeof(this) !== 'object' ) throw new Error('non-Object encountered within model JSON array: index=' + index);
			_resource.contents.push(new MObject(this, null, null));
		});

		return _resource;


		// TODO  the following is still somewhat specific for Concrete => separate out factory function

		/**
		 * A <em>model</em> object.
		 */
		function MObject(initData, parent, containingFeature) {	/* analogous to org.eclipse.emf.ecore.EObject (or org.eclipse.emf.ecore.impl.EObjectImpl / DynamicEObjectImpl) */

			if( typeof(initData) !== 'object' ) throw new Error('MObject constructor called with non-Object initialisation data: ' + JSON.stringify(initData) );
			jsmf.util.checkClass(this);

			var className = initData['_class'];
			this._class = metaModel.classifiers[className];
			if( !this._class ) throw new Error("declared object's type '" + className + "' not defined in meta model");
			if( this._class['abstract'] ) throw new Error("class '" + className + "' is abstract and cannot be instantiated");

			log( "constructing an instance of '" + className + "' with initialisation data: " + JSON.stringify(initData) );

			this.resource = _resource;
			this.container = parent;
			this.containingFeature = containingFeature;

			var _allFeatures = this._class.allFeatures();

			var validPropertyNames = [ "_class" ].concat(this._class.allAnnotations()).concat($.map(_allFeatures, function(value, key) { return key; }));
			jsmf.util.checkProperties(initData, validPropertyNames);

			var _self = this;	// for use in closures, to be able to access public features (can't do that through `this.`)

			var settings = {};

			// traverse values/settings of features:
			$.map(_allFeatures, function(feature, featureName) {
				var value = initData[featureName];
				log("\tsetting value of feature named '" + featureName + "' with value: " + JSON.stringify(value));
				if( value ) {
					settings[featureName] = (function() {
						switch(feature.kind) {
							case 'attribute':	return value;
							case 'containment':	return createNestedObject(feature, value, function(_value, type) { return new MObject(_value, _self, feature); });
							case 'reference':	return createNestedObject(feature, value, function(_value, type) { return new Proxy(_value, type); });
						}
					})();
					if( feature.isNameFeature() ) {
						_self.name = value;
					}
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
					// TODO  consider not allowing this type of shortcuts
					return [ object ];
				}
				return object;
			}

			function getFeature(featureArg, eClass) {
				if( typeof(featureArg) === 'string' )			return eClass.allFeatures()[featureArg];
				if( featureArg instanceof jsmf.meta.EFeature )	return featureArg;
				throw new Error('invalid feature argument to {g|s}et: ' + JSON.stringify(featureArg));
			}

			this.get = function(featureArg) {
				var feature = getFeature(featureArg, this._class);
				var value = settings[feature.name];
				switch(feature.kind) {
					case 'attribute':	return value;
					case 'containment':	return value;
					case 'reference':	{
						if( value instanceof Proxy ) {
							var target = value.resolve();
							settings[feature.name] = target;
							return target;
						}
						return value;
					}
				}
			};

			this.set = function(featureArg, value) {
				var feature = getFeature(featureArg, this._class);
				settings[feature.name] = value;
			};

			this.uri = function() {
				if( this.container == null ) {
					if( !this.name ) throw new Error("cannot compute URI for object due to missing name");
						// TODO  switch to a count-based system for name-less things
					return '/' + this.name;
				}
				return this.container.uri() + '.' + this.containingFeature.name + '/' + this.name;
			};

			// TODO  add convenience function for traversal and such

			// simple, switchable debugging (remove later):
			function log(message) {
				if( false ) {
					console.log(message);
				}
			}

		}

		function Proxy(_uriString, type) {

			this.uriString = _uriString;
			this.uri = jsmf.resolver.createUri(_uriString);
			this.type = type;

			this.resolve = function() {
				return this.uri.resolveInResource(_resource);
			};

			this.isProxy = function() {
				return true;
			};

		}

	};

	function Resource(metaModel) {

		this.metaModel = metaModel;
		this.contents = [];

		/**
		 * Converts this Resource to JSON, with references in the correct textual format - see below.
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
				json['_class'] = eObject._class.name;

				$.map(eObject._class.allFeatures(), function(feature, featureName) {
					var convertedValue = convertValue(eObject.get(featureName), feature);
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
							if( value.isProxy )	return value.uriString;
							return value.uri();
						}
					}
				}

			}

		};

	}


});

