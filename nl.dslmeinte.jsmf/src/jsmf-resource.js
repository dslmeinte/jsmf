/*
 * Management of whole models. Includes reasoning about paths/URIs within MResource-s
 * to point at contained objects.
 * 
 * (c) 2012 Meinte Boersma
 */


/**
 * Holds an entire model conforming to the given {@param metaModel}.
 */
/*global $:false, jsmf:false */
jsmf.model.MResource = function(metaModel, localIdMap) {

	"use strict";	// annotation for ECMAScript5

	this.metaModel = metaModel;
	this.contents = new jsmf.model.MList(this, null, null);

	/**
	 * Converts this Resource to JSON, with references in the correct textual format.
	 */
	this.toJSON = function() {
		return this.contents.toJSON();
	};

	var listeners = [];

	this.addListener = function(listener) {
		listeners.push(listener);
	};


	// farm out notifications across listeners:

	this.notifyValueAdded = function(mList, index, value) {
		$(listeners).each(function() {
			this.notifyValueAdded(mList, index, value);
		});
	};

	this.notifyValueRemoved= function(mList, index, removedValue) {
		$(listeners).each(function() {
			this.notifyValueRemoved(mList, index, removedValue);
		});
	};

	this.notifyListChanged = function(mList, index) {
		$(listeners).each(function() {
			this.notifyListChanged(mList, index);
		});
	};

	this.notifyValueChanged = function(mObject, feature, oldValue, newValue) {
		$(listeners).each(function() {
			this.notifyValueChanged(mObject, feature, oldValue, newValue);
		});
	};

	this.resolveById = function(localId) {
		return localIdMap[localId];
	};

};


/**
 * A generic factory object (singleton) for creating MResource-s from JSON.
 */
/*jshint sub:true */
jsmf.model.Factory = function() {

	"use strict";	// annotation for ECMAScript5

	/**
	 * Given a JSON representation for the model, its meta model in the jsmf.meta.MetaModel format
	 * and an optional callback object for signaling (about) format- and model-level problems.
	 * This callback object must have a function with the following signature: <tt>reportError(msg : String)</tt>.
	 */
	function createMResource(modelJSON, metaModel, validationCallback) {

		var localIdMap = {};

		var _resource = new jsmf.model.MResource(metaModel, localIdMap);	// (have to use _prefix to soothe JS plug-in)

		if( !$.isArray(modelJSON) ) throw 'model JSON is not an array of objects';
		$(modelJSON).each(function(index) {
			if( typeof(this) !== 'object' ) throw 'non-Object encountered within model JSON array: index=' + index;
			_resource.contents.add(createMObject(this, null, null));
		});

		return _resource;


		function createMObject(initData, container, containingFeature) {	/* analogous to org.eclipse.emf.ecore.EObject (or org.eclipse.emf.ecore.impl.EObjectImpl / DynamicEObjectImpl) */

			if( typeof(initData) !== 'object' ) throw 'MObject constructor called with non-Object initialisation data: ' + JSON.stringify(initData);
			jsmf.util.checkMetaType(initData);

			var metaTypeName = initData.metaType;
			var metaType = metaModel.classifiers[metaTypeName];
			if( !metaType ) {
				throw "declared object's type '" + metaTypeName + "' not defined in meta model";
			}
			if( metaType['abstract'] ) throw "class '" + metaTypeName + "' is abstract and cannot be instantiated";

			var _allFeatures = metaType.allFeatures();
			var initSettings = initData.settings || [];
			var initAnnotationSettings = initData['@settings'] || [];
			var localId = initData.localId;

			var validPropertyNames = $.map(_allFeatures, function(value, key) { return key; });

			jsmf.util.log( "constructing an instance of '" + metaTypeName + "' with initialisation data: " + JSON.stringify(initData) );

			var mObject = new jsmf.model.MObject(metaType, localId, _resource, container, containingFeature);

			if( localId !== undefined ) {
				if( localIdMap[localId] ) {
					throw 'duplicate local-id encountered: ' + localId;
				}
				localIdMap[localId] = mObject;
			}

			// traverse values/settings of features:
			var setFeatureNames = {};
			$.map(_allFeatures, function(feature, featureName) {
				var value = initSettings[featureName];
				jsmf.util.log("\tsetting value of feature named '" + featureName + "' with value: " + JSON.stringify(value));
				if( value ) {
					mObject.set(feature, (function() {
						switch(feature.kind) {
							case 'attribute':	return value;
							case 'containment':	return createNestedObject(feature, value, function(_value, type) { return createMObject(_value, mObject, feature); });
							case 'reference':	return createNestedObject(feature, value, function(_value, type) { return new jsmf.model.ProxySetting(feature, _value, _resource); });
						}})()
					);
					setFeatureNames[featureName] = true;
				} else {
					if( feature.required && validationCallback ) {
						validationCallback.reportError("no value given for required feature named '" + featureName + "'");
					}
				}
				jsmf.util.log("\t(set value of feature named '" + featureName + "')");
			});

			// check which properties of the initSettings are not mapped to features:
			$.map(initSettings, function(setting, settingName) {
				if( !setFeatureNames[settingName] ) {
					jsmf.util.log("\tencountered a setting without feature: " + settingName + " -> " + JSON.stringify(setting));
					// TODO  add them into the MObject instance anyway
				}
			});

			return mObject;


			function createNestedObject(feature, value, creator) {
				if( $.isArray(value) ) {
					if( !feature.manyValued && validationCallback ) {
						validationCallback.reportError('cannot load an array into the single-valued feature ' + feature.containingClass.name + '#' + feature.name);
					}
					return new jsmf.model.MList(_resource, container, feature, $.map(value, function(nestedValue, index) {
											return creator(nestedValue, feature.type);
										})
									);
				}
				if( feature.manyValued && validationCallback ) {
					validationCallback.reportError('cannot load a single, non-array value into the multi-valued feature ' + feature.containingClass.name + '#' + feature.name);
				}
				return creator(value, feature.type);
			}

		}

	}

	return {
		'createMResource':	createMResource
	};

}();

