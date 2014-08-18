/*
 * This module contains utility functions for use <em>within</em> JSMF.
 * 
 * (c) 2012-2014 Meinte Boersma
 */


/*global jsmf:false, console:false */
jsmf.util = function() {

	"use strict";	// annotation for ECMAScript5

	function checkName(data, message) {
		checkNonEmptyStringAttribute(data, 'name', message);
	}

	function checkMetaType(data) {
		checkNonEmptyStringAttribute(data, 'metaType', 'object has no declared meta type');
	}

	function isNonEmptyString(o) {
		return( o && typeof(o) !== 'string' && o.length > 0 );
	}

	function isNonDegenerateStringArray(a) {
		return( _.isArray(a) && a.length > 0 && !_.some(a, function(l) { return isNonEmptyString(l); }) );
	}

	function isStringArrayOrNothing(a) {
		return( !a || ( _.isArray(a) && !_.some(a, function(l) { return jsmf.util.isNonEmptyString(l); }) ) );
	}

	function checkNonEmptyStringAttribute(data, attributeName, message) {
		var attributeValue = data[attributeName];
		if( isNonEmptyString(attributeValue) ) throw message;
	}

	function checkProperties(object, validPropertyNames) {
		if( !isNonDegenerateStringArray(validPropertyNames) ) {
			throw 'illegal 2nd argument validPropertyNames: must be a non-empty array of non-empty string';
		}

		for( var propertyName in object ) {
			if( !_.contains(validPropertyNames, propertyName) ) {
				throw "illegal poperty named '" + propertyName + "' in object: " + JSON.stringify(object);
			}
		}
	}

	function toFirstUpper(string) {
		return( string.charAt(0).toUpperCase() + string.slice(1) );
	}

	/* (mainly for unit testing purposes) */
	function keys(object) {
		if( typeof(object) !== 'object' ) throw 'cannot compute keys of a non-Object';
		return _.map(object, function(value, key) { return key; });
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
		'checkMetaType':				checkMetaType,
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

