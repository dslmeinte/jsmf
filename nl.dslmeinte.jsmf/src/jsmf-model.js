/*
 * This corresponds to the pure/base part of EMF.
 * 
 * (c) 2012 Meinte Boersma
 */


jsmf.model = {};

"use strict";


jsmf.model.Factory = new (function() {

	this.createMResource = function(modelJSON, metaModel) {

		var _resource = new jsmf.model.MResource(metaModel);	// (have to use _prefix to soothe JS plug-in)

		if( !$.isArray(modelJSON) ) throw new Error('model JSON is not an array of objects');
		$(modelJSON).each(function(index) {
			if( typeof(this) !== 'object' ) throw new Error('non-Object encountered within model JSON array: index=' + index);
			_resource.contents.add(createMObject(this, null, null));
		});

		return _resource;


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

			jsmf.util.log( "constructing an instance of '" + className + "' with initialisation data: " + JSON.stringify(initData) );

			var mObject = new jsmf.model.MObject(_class, _resource, parent, containingFeature);

			// traverse values/settings of features:
			$.map(_allFeatures, function(feature, featureName) {
				var value = initData[featureName];
				jsmf.util.log("\tsetting value of feature named '" + featureName + "' with value: " + JSON.stringify(value));
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
				jsmf.util.log("\t(set value of feature named '" + featureName + "')");
			});

			return mObject;


			function createNestedObject(feature, value, creator) {
				if( $.isArray(value) ) {
					if( !feature.manyValued() ) throw new Error('cannot load an array into the single-valued feature ' + feature.containingClass.name + '#' + feature.name);
					return new jsmf.model.MList(feature, $.map(value, function(nestedValue, index) {
											return creator.apply(this, [ nestedValue, feature.type ]);
										})
									);
				}
				if( feature.manyValued() ) throw new Error('cannot load a single, non-array value into the multi-valued feature ' + feature.containingClass.name + '#' + feature.name);
				return creator.apply(this, [ value, feature.type ]);
			}

		}

	};



})();


/**
 * An abstract type (for values of non-Attribute features).
 */
jsmf.model.MElement = function() {
	throw new Error("MElement is abstract");
};


/**
 * A <em>model</em> object.
 */
jsmf.model.MObject = function(_class, resource, container, containingFeature) {

	this._class = _class;
	this.resource = resource;
	this.container = container;
	this.containingFeature = containingFeature;

	var settings = {};

	this.get = function(featureArg) {
		var feature = this._class.getFeature(featureArg);
		var setting = settings[feature.name];
		var value = feature.get(setting);
		settings[feature.name] = value;
		return value;
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

	this.toJSON = function() {
		var json = {};
		json._class = this._class.name;

		var _self = this;
		$.map(this._class.allFeatures(), function(feature, featureName) {
			var convertedValue = feature.toJSON(_self.get(feature));
			if( convertedValue != undefined ) {
				json[featureName] = convertedValue;
			}
		});

		return json;
	};

	// TODO  add functions for traversal and notification

};

jsmf.model.MObject.prototype = jsmf.model.MElement;


/**
 * Holds the values of a many-valued (non-Attribute) feature.
 * <p>
 * We need this to be able to do distinguish the collection of
 * values vs. the individual values, e.g. to be able to do
 * notifications on changes of either sort.
 * <p>
 * We also need this to be able to keep track of opposites.
 */
jsmf.model.MList = function(feature, /* optional with default=[]: */ initialValues) {

	/*
	 * If feature == null, then this MList instance is contained by an MResource as its 'contents' feature.
	 * Note: feature is currently unused.
	 */
	var values = initialValues || [];

	this.get = function(index) {
		checkIndex(index);
		return values[index];
	};

	this.values = function() {
		return values;
	};

	this.add = function(value, /* optional: */ optIndex) {
		if( optIndex != undefined ) {
			checkIndex(optIndex, true);
			values.splice(optIndex, 0, value);
		} else {
			values.push(value);
		}
	};

	this.removeValue = function(index) {
		checkIndex(index);
		values.splice(index, 1);
	};

	function checkIndex(index, /* optional with default=false: */ adding) {
		if( typeof(index) !== 'number' ) {
			throw new Error("list index must be a number");
		}
		if( index < 0 ) {
			throw new Error("list index must be non-negative");
		}
		if( index >= values.length ) {
			if( !(adding && index === values.length) ) {
				throw new Error("list index out of bounds");
			}
		}
	}

	this.toJSON = function() {
		return $.map(values, function(item, i) {
			return item.toJSON();
		});
	};

	this.uri = function() {
		return $.map(values, function(value, index) {
			return value.uri().toString();
		});
	};

};

jsmf.model.MList.prototype = jsmf.model.MElement;


/**
 * Holds the as-yet-unresolved target of a reference.
 */
jsmf.model.MProxy = function(uriString, type, resource) {

	this.type = type;

	var computedUri = jsmf.resolver.createUri(uriString);
	this.uri = function() {
		return computedUri;
	};

	this.resolve = function() {
		return computedUri.resolveInResource(resource);
		// TODO  do something with type info as well (e.g., validate)
	};

};


/**
 * Holds an entire model conforming to the given {@param metaModel}.
 */
jsmf.model.MResource = function(metaModel) {

	this.metaModel = metaModel;
	this.contents = new jsmf.model.MList(null);

	/**
	 * Converts this Resource to JSON, with references in the correct textual format.
	 */
	this.toJSON = function() {
		return this.contents.toJSON();
	};

};


