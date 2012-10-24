/*
 * This corresponds to the pure/base part of EMF.
 * 
 * (c) 2012 Meinte Boersma
 */

jsmf.model = new (function() {

	"use strict";	// annotation for jsHint

	var module = this;


	/**
	 * A <em>model</em> object.
	 */
	this.MObject = function(_class, resource, container, containingFeature) {

		this._class = _class;

		var settings = {};

		/**
		 * {@returns} The value of the indicated feature.
		 * The type of the value is either an MObject, an MList, a String, a Boolean or a Number.
		 */
		this.get = function(featureArg) {
			var feature = this._class.getFeature(featureArg);
			var setting = settings[feature.name];
			if( !setting ) return undefined;

			var value = setting.get();
			if( setting instanceof module.ProxySetting ) {
				settings[feature.name] = new module.ReferenceSetting(feature, value);	// re-set setting for resolved proxy
			}
			return value;
		};

		/**
		 * Sets the value of the indicated feature to the given {@code new value}.
		 */
		this.set = function(featureArg, newValue) {
			var feature = this._class.getFeature(featureArg);
			var oldSetting = settings[feature.name];
			var oldValue = ( oldSetting ? oldSetting : null );
			if( oldValue !== newValue ) {
				// TODO  type checking
				settings[feature.name] = createSetting(feature, newValue);
				resource.notifyValueChanged(this, feature, oldValue, newValue);
			}
			return this;	// for chaining
		};

		/**
		 * {@returns} A complete URI string of <b>this</b> MObject or produces an Error.
		 */
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
				var setting = settings[featureName];
				if( setting ) {
					var convertedValue = setting.toJSON();
					if( convertedValue != undefined ) {
						json[featureName] = convertedValue;
					}
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
	* Common, abstract super type for the two concrete sub types of a Setting w.r.t. a reference feature.
	*/
	this.Setting = function(feature) {

		/**
		 * {@returns} The value of this Setting. It has the same range of types as MObject#get.
		 */
		this.get = function() {
			throw new Error("Setting#get not implemented!");
		};

		this.toJSON = function() {
			throw new Error("Setting#toJSON not implemented!");
		};

		var annotationSettings = {};

		this.getAnnotation = function(annotationName) {
			feature.checkAnnotation(annotationName);
			return annotationSettings[annotationName];
		};

		this.setAnnotation = function(annotationName, value) {
			feature.checkAnnotation(annotationName);
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
	this.MList = function(resource, container, feature, /* optional with default=[]: */ initialValues) {

		module.Setting.call(this, [ feature ]);

		/*
		 * If feature == null, then this MList instance is contained by an MResource as its 'contents' feature.
		 */
		var values = initialValues || [];

		/**
		 * (For internal use only!)
		 */
		this.get = function() {
			return this;
		};

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
				if( !value.uri ) throw new Error();
				return value.uri().toString();
			});
		};

		this.each = function(iterator) {
			$(values).each(iterator);
		};

		this.find = function(indicator) {
			return $(values).filter(indicator).first();
		};

		this.map = function(mapper) {
			return $.map(values, mapper);
		};

		// TODO  add more functions for traversal

	};
	oo.util.extend(this.Setting, this.MList);


	this.AttributeSetting = function(feature, value) {
		module.Setting.call(this, [ feature ]);
		this.get = function()		{ return value; };
		this.toJSON = function()	{ return value; };
	};
	oo.util.extend(this.Setting, this.AttributeSetting);


	this.ContainmentSetting = function(feature, value) {
		module.Setting.call(this, [ feature ]);
		this.get = function()		{ return value; };
		this.toJSON = function()	{ return( value ? value.toJSON() : undefined ); };
	};
	oo.util.extend(this.Setting, this.ContainmentSetting);


	this.ProxySetting = function(feature, uriString, resource) {
		module.Setting.call(this, [ feature ]);
		var computedUri = module.Factory.createUri(uriString);
		this.toJSON = function() {
			return uriString;
		};
		this.get = function() {
			return computedUri.resolveInResource(resource);
			// TODO  do something with type info as well (e.g., validate)
		};
		this.uri = function() {
			return uriString;
		};
	};
	oo.util.extend(this.Setting, this.ProxySetting);


	this.ReferenceSetting = function(feature, value) {
		module.Setting.call(this, [ feature ]);
		this.get = function()		{ return value; };
		this.toJSON = function()	{ return value.uri(); };
	};
	oo.util.extend(this.Setting, this.ReferenceSetting);


	function createSetting(feature, value) {
		switch(feature.kind) {
			case 'attribute':	return new module.AttributeSetting(feature, value);
			case 'containment':	return new module.ContainmentSetting(feature, value);
			case 'reference': {
				if( typeof(value) === 'string' ) {
					return new module.ProxySetting(feature, value, resource);
				}
				if( value instanceof module.ProxySetting ) {
					return value;
				}
				return new module.ReferenceSetting(feature, value);
			}
		}
	}

})();

