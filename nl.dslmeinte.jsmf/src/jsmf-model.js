/*
 * This corresponds to the pure/base part of EMF.
 * 
 * (c) 2012 Meinte Boersma
 */

/*global $:false, jsmf:false, oo:false */
jsmf.model = function() {

	"use strict";	// annotation for ECMAScript5


	/**
	 * A <em>model</em> object.
	 */
	function MObject(metaType, localId, resource, container, containingFeature) {

		this.metaType = metaType;

		this.localId = localId;

		var settings = {};

		/**
		 * {@return} The value of the indicated feature.
		 * The type of the value is either an MObject, an MList, a String, a Boolean or a Number.
		 */
		this.get = function(featureArg) {
			var feature = this.metaType.getFeature(featureArg);
			var setting = settings[feature.name];
			if( !setting ) return undefined;

			var value = setting.get();
			if( setting instanceof ProxySetting ) {
				settings[feature.name] = new ReferenceSetting(feature, value);	// re-set setting for resolved proxy
			}
			return value;
		};

		/**
		 * Sets the value of the indicated feature to the given {@code new value}.
		 */
		this.set = function(featureArg, newValue) {
			var feature = this.metaType.getFeature(featureArg);
			var oldSetting = settings[feature.name];
			var oldValue = ( oldSetting ? oldSetting : null );
			if( oldValue !== newValue ) {
				// TODO  type checking
				settings[feature.name] = createSetting(feature, newValue, resource);
				resource.notifyValueChanged(this, feature, oldValue, newValue);
			}
			return this;	// for chaining
		};

		this.toJSON = function() {
			var json = {};
			json.metaType = this.metaType.name;
			json.localId = this.localId;
			json.settings = {};

			$.map(this.metaType.allFeatures(), function(feature, featureName) {
				var setting = settings[featureName];
				if( setting ) {
					var convertedValue = setting.toJSON();
					if( convertedValue !== undefined ) {
						json.settings[featureName] = convertedValue;
					}
				}
			});

			$.map(this.metaType.allAnnotations(), function(annotationName) {
				json['@settings'][annotationName] = annotationSettings[annotationName];
			});

			return json;
		};


		var annotationSettings = {};

		this.getAnnotation = function(annotationName) {
			this.metaType.checkAnnotation(annotationName);
			return annotationSettings[annotationName];
		};

		this.setAnnotation = function(annotationName, value) {
			this.metaType.checkAnnotation(annotationName);
			annotationSettings[annotationName] = value;
			return this;	// for chaining
		};

	}


	/**
	* Common, abstract super type.
	*/
	function Setting(feature) {

		/**
		 * {@return} The value of this Setting. It has the same range of types as MObject#get.
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

		this.annotationsToJSON = function() {
			// TODO  implement!
		};

	}


	/**
	 * Holds the values of a many-valued (non-Attribute) feature.
	 * <p>
	 * We need this to be able to do distinguish the collection of
	 * values vs. the individual values, e.g. to be able to do
	 * notifications on changes of either sort.
	 * <p>
	 * We also need this to be able to keep track of opposites.
	 */
	function MList(resource, container, feature, /* optional with default=[]: */ initialValues) {

		Setting.call(this, feature);

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
			if( optIndex !== undefined ) {
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

	}
	oo.util.extend(Setting, MList);


	function AttributeSetting(feature, value) {
		Setting.call(this, feature);
		this.get = function()		{ return value; };
		this.toJSON = function()	{ return value; };
	}
	oo.util.extend(Setting, AttributeSetting);


	function ContainmentSetting(feature, value) {
		Setting.call(this, feature);
		this.get = function()		{ return value; };
		this.toJSON = function()	{ return( value ? value.toJSON() : undefined ); };
	}
	oo.util.extend(Setting, ContainmentSetting);


	function ProxySetting(feature, refObject, resource, validationCallback) {
		Setting.call(this, feature);
		this.toJSON = function() { return createReferenceJSON(this); };
		this.get = function() {
			return resource.resolveById(refObject.localRefId);
		};
	}
	oo.util.extend(Setting, ProxySetting);


	function ReferenceSetting(feature, value) {
		Setting.call(this, feature);
		this.get = function()		{ return value; };
		this.toJSON = function()	{
			if( feature.manyValued ) {
				return value.map(function(memberValue) { return createReferenceJSON(memberValue); });
			} else {
				return createReferenceJSON(this);
			}
		};
	}
	oo.util.extend(Setting, ReferenceSetting);


	function createSetting(feature, value, resource) {
		switch(feature.kind) {
			case 'attribute':	return new AttributeSetting(feature, value);
			case 'containment':	return new ContainmentSetting(feature, value);
			case 'reference': {
				if( typeof(value) === 'string' ) {
					return new ProxySetting(feature, value, resource);
				}
				if( value instanceof ProxySetting ) {
					return value;
				}
				return new ReferenceSetting(feature, value);
			}
		}
	}


	function createReferenceJSON(setting) {
		return { 'localRefId':	setting.get().localId };
	}


	return {
		'MObject':				MObject,
		'Setting':				Setting,
		'MList':				MList,
		'AttributeSetting':		AttributeSetting,
		'ContainmentSetting':	ContainmentSetting,
		'ProxySetting':			ProxySetting,
		'ReferenceSetting':		ReferenceSetting
	};

}();

