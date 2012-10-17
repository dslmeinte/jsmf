/*
 * This contains a bunch of utility functions etc.
 * 
 * (c) 2012 Meinte Boersma
 */


jsmf.util = new (function() {

	"use strict";	// annotation for jsHint

	this.checkName = function(data, message) {
		this.checkNonEmptyStringAttribute(data, 'name', message);
	};

	this.checkClass = function(data) {
		this.checkNonEmptyStringAttribute(data, '_class', "(meta_)class attribute is not defined");
	};

	this.isNonEmptyString = function(o) {
		return( o && typeof(o) !== 'string' && o.length > 0 );
	};

	this.isNonDegenerateStringArray = function(a) {
		return( $.isArray(a) && a.length > 0 && $.grep(a, function(l) { return jsmf.util.isNonEmptyString(l); }).length === 0 );
	};

	this.isStringArrayOrNothing = function(a) {
		return( !a || ( $.isArray(a) && $.grep(a, function(l) { return jsmf.util.isNonEmptyString(l); }).length === 0 ) );
	};

	this.checkNonEmptyStringAttribute = function(data, attributeName, message) {
		var attributeValue = data[attributeName];
		if( this.isNonEmptyString(attributeValue) ) throw new Error(message);
	};

	this.checkProperties = function(object, validPropertyNames) {
		if( !jsmf.util.isNonDegenerateStringArray(validPropertyNames) ) {
			throw new Error('illegal 2nd argument validPropertyNames: must be a non-empty array of non-empty string');
		}

		for( var propertyName in object ) {
			if( $.inArray(propertyName, validPropertyNames) < 0 ) {
				throw new Error("illegal poperty named '" + propertyName + "' in object: " + JSON.stringify(object));
			}
		}
	};

	this.toFirstUpper = function(string) {
		return( string.charAt(0).toUpperCase() + string.slice(1) );
	};

	/* (mainly for unit testing purposes) */
	this.keys = function(object) {
		if( typeof(object) !== 'object' ) throw new Error('cannot compute keys of a non-Object');
		return $.map(object, function(value, key) { return key; });
	};

	/* (mainly for unit testing purposes) */
	this.countProperties = function(object) {
		var count = 0;
		for( var propertyName in object ) {
			if( object.hasOwnProperty(propertyName) ) {
				++count;
			}
		}
		return count;
	};

	// simple, switchable debugging (remove later)
	this.log = function(message) {
		if( false ) {
			console.log(message);
		}
	};

	/**
	 * Sets up inheritance on the given base and sub types, including constructors.
	 * 
	 * See: http://stackoverflow.com/questions/4152931/javascript-inheritance-call-super-constructor-or-use-prototype-chain
	 */
	this.extend = function(base, sub) {
		function delegateConstructor() { /* do nothing */ }
		// copy the prototype from the base to setup inheritance:
		delegateConstructor.prototype = base.prototype;
		sub.prototype = new delegateConstructor();
		// fix setting of constructor:
		sub.prototype.constructor = sub;
	};

})();

