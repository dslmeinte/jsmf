/*
 * This module contains utility functions for use <em>within</em> JSMF.
 * 
 * (c) 2012 Meinte Boersma
 */


/*global $:false, jsmf:false, console:false */
jsmf.util = function() {

	"use strict";	// annotation for ECMAScript5

	function checkName(data, message) {
		checkNonEmptyStringAttribute(data, 'name', message);
	}

	function checkClass(data) {
		checkNonEmptyStringAttribute(data, '_class', "(meta_)class attribute is not defined");
	}

	function isNonEmptyString(o) {
		return( o && typeof(o) !== 'string' && o.length > 0 );
	}

	function isNonDegenerateStringArray(a) {
		return( $.isArray(a) && a.length > 0 && $.grep(a, function(l) { return isNonEmptyString(l); }).length === 0 );
	}

	function isStringArrayOrNothing(a) {
		return( !a || ( $.isArray(a) && $.grep(a, function(l) { return jsmf.util.isNonEmptyString(l); }).length === 0 ) );
	}

	function checkNonEmptyStringAttribute(data, attributeName, message) {
		var attributeValue = data[attributeName];
		if( isNonEmptyString(attributeValue) ) throw new Error(message);
	}

	function checkProperties(object, validPropertyNames) {
		if( !isNonDegenerateStringArray(validPropertyNames) ) {
			throw new Error('illegal 2nd argument validPropertyNames: must be a non-empty array of non-empty string');
		}

		for( var propertyName in object ) {
			if( $.inArray(propertyName, validPropertyNames) < 0 ) {
				throw new Error("illegal poperty named '" + propertyName + "' in object: " + JSON.stringify(object));
			}
		}
	}

	function toFirstUpper(string) {
		return( string.charAt(0).toUpperCase() + string.slice(1) );
	}

	/* (mainly for unit testing purposes) */
	function keys(object) {
		if( typeof(object) !== 'object' ) throw new Error('cannot compute keys of a non-Object');
		return $.map(object, function(value, key) { return key; });
	}

	/* (mainly for unit testing purposes) */
	function countProperties(object) {
		var count = 0;
		for( var propertyName in object ) {
			if( object.hasOwnProperty(propertyName) ) {
				++count;
			}
		}
		return count;
	}

	// simple, switchable debugging (remove later)
	function log(message) {
		if( false ) {
			console.log(message);
		}
	}

	return {
		'checkName':					checkName,
		'checkClass':					checkClass,
		'isNonEmptyString':				isNonEmptyString,
		'isNonDegenerateStringArray':	isNonDegenerateStringArray,
		'isStringArrayOrNothing':		isStringArrayOrNothing,
		'checkNonEmptyStringAttribute':	checkNonEmptyStringAttribute,
		'checkProperties':				checkProperties,
		'toFirstUpper':					toFirstUpper,
		'log':							log,
		'testing': {
			'keys':				keys,
			'countProperties':	countProperties
		}
	};

}();

