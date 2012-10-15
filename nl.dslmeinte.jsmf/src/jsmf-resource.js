/*
 * Management of whole models. Includes reasoning about paths/URIs within MResource-s
 * to point at contained objects.
 * 
 * (c) 2012 Meinte Boersma
 */


/**
 * Holds an entire model conforming to the given {@param metaModel}.
 */
jsmf.model.MResource = function(metaModel) {

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

	this.notifyListChanged = function(mObject, feature) {
		$(listeners).each(function() {
			this.notifyListChanged(mList, index);
		});
	};

	this.notifyValueChanged = function(mObject, feature, oldValue, newValue) {
		$(listeners).each(function() {
			this.notifyValueChanged(mObject, feature, oldValue, newValue);
		});
	};

};


/**
 * A generic factory object (singleton) for creating MResource-s from JSON.
 */
jsmf.model.Factory = new (function() {

	"use strict";

	this.createMResource = function(modelJSON, metaModel) {

		var _resource = new jsmf.model.MResource(metaModel);	// (have to use _prefix to soothe JS plug-in)

		if( !$.isArray(modelJSON) ) throw new Error('model JSON is not an array of objects');
		$(modelJSON).each(function(index) {
			if( typeof(this) !== 'object' ) throw new Error('non-Object encountered within model JSON array: index=' + index);
			_resource.contents.add(createMObject(this, null, null));
		});

		return _resource;


		function createMObject(initData, container, containingFeature) {	/* analogous to org.eclipse.emf.ecore.EObject (or org.eclipse.emf.ecore.impl.EObjectImpl / DynamicEObjectImpl) */

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

			var mObject = new jsmf.model.MObject(_class, _resource, container, containingFeature);

			// traverse values/settings of features:
			$.map(_allFeatures, function(feature, featureName) {
				var value = initData[featureName];
				jsmf.util.log("\tsetting value of feature named '" + featureName + "' with value: " + JSON.stringify(value));
				if( value ) {
					mObject.set(feature, (function() {
						switch(feature.kind) {
							case 'attribute':	return value;
							case 'containment':	return createNestedObject(feature, value, function(_value, type) { return createMObject(_value, mObject, feature); });
							case 'reference':	return createNestedObject(feature, value, function(_value, type) { return new jsmf.model.ProxySetting(feature, _value, _resource); });
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
					return new jsmf.model.MList(_resource, container, feature, $.map(value, function(nestedValue, index) {
											return creator.apply(this, [ nestedValue, feature.type ]);
										})
									);
				}
				if( feature.manyValued() ) throw new Error('cannot load a single, non-array value into the multi-valued feature ' + feature.containingClass.name + '#' + feature.name);
				return creator.apply(this, [ value, feature.type ]);
			}

		}

	};


	// TODO  fix implementation of regex check:
	//var uriRegExp = /^(\/\w+(\.\w+)?)*\/\w+$/g;
	//uriRegExp.compile();

	/**
	 * {code path} is a string in the format
	 *		"/name1(.feature1)?/name2(.feature2)?/.../name$n$"
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
	this.createUri = function(uriString) {

		if( typeof(uriString) !== 'string' ) throw new Error('URI must be a String');
//		if( !uriRegExp.test(uriString) ) throw new Error('URI must have the correct format: ' + uriString);
		var _fragments = uriString.slice(1).split('/');
		var uri = new Uri(uriString);
		$(_fragments).each(function(i) {		// this is a String
			var splitFragment = this.split('.');
			uri.fragments[i] = new uri.Fragment(splitFragment[0], ( splitFragment.length === 1 ? null : splitFragment[1] ));
		});
		return uri;


		function Uri(uriString) {

			this.toString = function() {
				return uriString;
			};

			this.fragments = [];

			this.Fragment = function(_name, _featureName) {

				this.name = _name;
				this.featureName = _featureName;	// may be null/undefined

				this.toString = function() {
					return( this.name + ( this.featureName ? ( '.' + this.featureName ) : '' ) );
				};

			};

			this.resolveInResource = function(resource) {
				var searchListOrObject = resource.contents;	// should only be an MObject _after_ last fragment, before that an MList
				$(this.fragments).each(function(index) {	// this is a Fragment
					searchListOrObject = findIn(this, searchListOrObject);
					if( !searchListOrObject ) throw new Error('could not resolve reference to object with fragment=' + this.toString() + ' (index=' + index + ')' );
					if( this.featureName ) {
						searchListOrObject = searchListOrObject.get(this.featureName);
					}
				});

				return searchListOrObject;

				function findIn(fragment, mList) {
					// TODO  rephrase in a functional style
					var match = null;
					mList.each(function(i) {
						if( this.name && this.name === fragment.name ) {
							match = this;
						}
					});
					return match;
				}

			};

		}

	};

})();

