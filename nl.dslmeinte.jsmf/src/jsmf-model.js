/*
 * This corresponds to the pure/base part of EMF.
 * 
 * (c) 2012 Meinte Boersma
 */


jsmf.model = new (function() {

	"use strict";


	/**
	 * A <em>model</em> object.
	 */
	this.MObject = function(_class, resource, container, containingFeature) {

		this._class = _class;
		this.resource = resource;
		this.container = container;
		this.containingFeature = containingFeature;

		var settings = {};

		this.get = function(featureArg) {
			var feature = this._class.getFeature(featureArg);
			var value = settings[feature.name];
			switch(feature.kind) {
				case 'attribute':	return value;
				case 'containment':	return value;
				case 'reference':	{
					if( value instanceof jsmf.model.MProxy ) {
						var target = value.resolve();
						settings[feature.name] = target;
						return target;
					}
					return value;
				}
			}
		};

		this.set = function(featureArg, value) {
			var feature = this._class.getFeature(featureArg);
			settings[feature.name] = value;
		};

		this.uri = function() {
			var objName = this.get('name');
			if( !this.container ) {
				if( !objName ) throw new Error("cannot compute URI for object due to missing name");
					// TODO  switch to a count-based system for name-less things
				return '/' + objName;
			}
			return this.container.uri() + '.' + this.containingFeature.name + '/' + objName;
		};

	};


	/**
	 * Holds the as-yet-unresolved target of a reference.
	 */
	this.MProxy = function(_uriString, type, resource) {

		this.uriString = _uriString;
		this.uri = jsmf.resolver.createUri(_uriString);
		this.type = type;

		this.resolve = function() {
			return this.uri.resolveInResource(resource);
		};

		this.isProxy = function() {
			return true;
		};

	};

	/**
	 * Holds the values of a many-valued (non-Attribute) feature.
	 * <p>
	 * We need this to be able to do distinguish the collection of
	 * values vs. the individual values, e.g. to be able to do
	 * notifications on changes of either sort.
	 * <p>
	 * We also need this to be able to keep track of opposites.
	 */
	this.MList = function(feature, initialValues) {

		var values = initialValues || [];

		this.get = function(index) {
			if( index != undefined ) {
				return values[index];	// TODO  add validation
			}
			return values;
		};

		this.add = function(value, optIndex) {
			if( optIndex != undefined ) {
				values.push(optIndex, value);	// FIXME
			} else {
				values.push(value);
			}
		};

		this.removeValue = function(index) {
			values.slice(index);	// FIXME
		};

	};


	this.createResource = function(modelJSON, metaModel) {	/* (somewhat) analogous to org.eclipse.emf.ecore.resource.Resource (or rather: org.eclipse.emf.ecore.resource.impl.ResourceImpl) */

		var _resource = new Resource(metaModel);	// (have to use _prefix to soothe JS plug-in)

		if( !$.isArray(modelJSON) ) throw new Error('model JSON is not an array of objects');
		$(modelJSON).each(function(index) {
			if( typeof(this) !== 'object' ) throw new Error('non-Object encountered within model JSON array: index=' + index);
			_resource.contents.push(createMObject(this, null, null));
		});

		return _resource;


		// TODO  the following is still somewhat specific for Concrete => separate out factory function

		// TODO  make separate factory methods for this

		function createMObject(initData, parent, containingFeature) {	/* analogous to org.eclipse.emf.ecore.EObject (or org.eclipse.emf.ecore.impl.EObjectImpl / DynamicEObjectImpl) */

			if( typeof(initData) !== 'object' ) throw new Error('MObject constructor called with non-Object initialisation data: ' + JSON.stringify(initData) );
			jsmf.util.checkClass(initData);

			var className = initData._class;
			var _class = metaModel.classifiers[className];
			if( !_class ) throw new Error("declared object's type '" + className + "' not defined in meta model");
			if( _class['abstract'] ) throw new Error("class '" + className + "' is abstract and cannot be instantiated");

			var _allFeatures = _class.allFeatures();

			var validPropertyNames = [ "_class" ].concat(_class.allAnnotations()).concat($.map(_allFeatures, function(value, key) { return key; }));
			jsmf.util.checkProperties(initData, validPropertyNames);

			log( "constructing an instance of '" + className + "' with initialisation data: " + JSON.stringify(initData) );

			var mObject = new jsmf.model.MObject(_class, _resource, parent, containingFeature);

			// traverse values/settings of features:
			$.map(_allFeatures, function(feature, featureName) {
				var value = initData[featureName];
				log("\tsetting value of feature named '" + featureName + "' with value: " + JSON.stringify(value));
				if( value ) {
					mObject.set(feature, (function() {
						switch(feature.kind) {
							case 'attribute':	return value;
							case 'containment':	return createNestedObject(feature, value, function(_value, type) { return createMObject(_value, mObject, feature); });
							case 'reference':	return createNestedObject(feature, value, function(_value, type) { return new jsmf.model.MProxy(_value, type, _resource); });
						}})());
					if( feature.isNameFeature() ) {
						mObject.name = value;
					}
				} else {
					if( feature.lowerLimit > 0 ) throw new Error("no value given for required feature named '" + featureName + "'");
				}
				log("\t(set value of feature named '" + featureName + "')");
			});

			return mObject;


			function createNestedObject(feature, value, creationFunc) {
				if( $.isArray(value) ) {
					if( !feature.manyValued() ) throw new Error('cannot load an array into the single-valued feature ' + feature.containingClass.name + '#' + feature.name);
					return new jsmf.model.MList(feature, $.map(value, function(nestedValue, index) {
											return creationFunc.apply(this, [ nestedValue, feature.type ]);
										})
									);
				}
				if( feature.manyValued() ) throw new Error('cannot load a single, non-array value into the multi-valued feature ' + feature.containingClass.name + '#' + feature.name);
				return creationFunc.apply(this, [ value, feature.type ]);
			}

			// TODO  add convenience function for traversal and such

			// simple, switchable debugging (remove later):
			function log(message) {
				if( false ) {
					console.log(message);
				}
			}

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
				if( !eObject ) {
					return null;
				}

				var json = {};
				json._class = eObject._class.name;

				$.map(eObject._class.allFeatures(), function(feature, featureName) {
					var convertedValue = convertValue(eObject.get(featureName), feature);
					if( convertedValue != undefined ) {
						json[featureName] = convertedValue;
					}
				});

				return json;

				function convertValue(value, feature) {
					if( feature.manyValued() ) {
						var json = [];
						if( value != undefined ) {
							$(value.get()).each(function(i) {
								json.push(convertSingleValue(this, feature));
							});
						}
						if( json.length > 0 ) {
							return json;
						}
						return undefined;
					}

					return convertSingleValue(value, feature);
				}

				function convertSingleValue(value, feature) {
					switch(feature.kind) {
						case 'attribute':	return value;
						case 'containment':	return convertObject(value);
						case 'reference':	{
							if( !value )		return null;
							return( value.isProxy ? value.uriString : value.uri() );
						}
					}
				}

			}

		};

	}


})();

