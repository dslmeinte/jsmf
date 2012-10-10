/*
 * This corresponds to the pure/base part of EMF.
 * 
 * (c) 2012 Meinte Boersma
 */


"use strict";


/**
 * A <em>model</em> object.
 */
jsmf.model.MObject = function(_class, resource, container, containingFeature) {

	this._class = _class;

	var settings = {};

	this.get = function(featureArg) {
		var feature = this._class.getFeature(featureArg);
		var setting = settings[feature.name];
		var value = feature.get(setting);
		settings[feature.name] = value;		// re-set setting for resolved proxies
		return value;
	};

	this.set = function(featureArg, newValue) {
		var feature = this._class.getFeature(featureArg);
		var oldValue = settings[feature.name];
		settings[feature.name] = newValue;
		if( oldValue !== newValue ) {
			resource.notifyValueChanged(this, feature, oldValue, newValue);
		}
		return this;	// for chaining
	};

	this.uri = function() {
		var objName = this.get('name');
		if( container === null ) {
			if( !objName ) throw new Error("cannot compute URI for object due to missing name");
				// TODO  switch to a count-based system for name-less things
			return '/' + objName;
		}
		return container.uri() + '.' + containingFeature.name + '/' + objName;
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
		$.map(this._class.allAnnotations(), function(annotationName) {
			json[annotationName] = _self.getAnnotation(annotationName);
		});

		return json;
	};


	var annotationSettings = {};

	this.getAnnotation = function(annotationName) {
		this._class.checkAnnotation(annotationName);
		return annotationSettings[annotationName];
	};

	this.setAnnotation = function(annotationName, value) {
		this._class.checkAnnotation(annotationName);
		annotationSettings[annotationName] = value;
		return this;	// for chaining
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
jsmf.model.MList = function(resource, container, feature, /* optional with default=[]: */ initialValues) {

	/*
	 * If feature == null, then this MList instance is contained by an MResource as its 'contents' feature.
	 * Note: feature is currently unused.
	 */
	var values = initialValues || [];

	this.at = function(index) {
		checkIndex(index);
		return values[index];
	};

	this.size = function() {
		return values.length;
	};

	this.add = function(value, /* optional: */ optIndex) {
		if( optIndex != undefined ) {
			checkIndex(optIndex, true);
			values.splice(optIndex, 0, value);
			resource.notifyValueAdded(this, optIndex, value);
		} else {
			values.push(value);
			resource.notifyValueAdded(this, values.length-1, value);
		}
		resource.notifyListChanged(container, feature);
	};

	this.removeValue = function(index) {
		checkIndex(index);
		var removedValue = values.splice(index, 1);
		resource.notifyValueRemoved(this, index, removedValue);
		resource.notifyListChanged(container, feature);
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
		return $.map(values, function(item) {
			return item.toJSON();
		});
	};

	this.uri = function() {
		return $.map(values, function(value) {
			return value.uri().toString();
		});
	};

	this.each = function(iterator) {
		$(values).each(iterator);
	};

	this.find = function(indicator) {
		$(values).filter(indicator).first();
	};

	// TODO  add more functions for traversal

	// TODO  Can MList-s have annotations as well (e.g., for viewing purposes like collapsed etc.)? In which case: how to declare such annotations in the meta model?

};


/**
 * Holds the as-yet-unresolved target of a reference.
 */
jsmf.model.MProxy = function(uriString, type, resource) {

	this.type = type;

	var computedUri = jsmf.model.Resolver.createUri(uriString);
	this.uri = function() {
		return computedUri;
	};

	this.resolve = function() {
		return computedUri.resolveInResource(resource);
		// TODO  do something with type info as well (e.g., validate)
	};

};

