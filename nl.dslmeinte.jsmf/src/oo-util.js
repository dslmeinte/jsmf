/*
 * This module contains utility functions for use <em>outside of</em> JSMF.
 * 
 * (c) 2012 Meinte Boersma
 */

var oo = {};

oo.util = new (function() {

	/**
	 * Sets up inheritance on the given base and sub types, including constructors.
	 * <p>
	 * See: http://stackoverflow.com/questions/4152931/javascript-inheritance-call-super-constructor-or-use-prototype-chain
	 * <p>
	 * Usage pattern:
	 * <pre>
	 * function SuperClass(initData) {}
	 * function SubClass(initData) {
	 * 	SuperClass.call(this, [ initData ]);
	 * }
	 * oo.util.extend(SuperClass, SubClass);
	 * </pre>
	 */
	this.extend = function(base, sub) {
		function delegateConstructor() { /* do nothing */ }
		// copy the prototype from the base to setup inheritance:
		delegateConstructor.prototype = base.prototype;
		sub.prototype = new delegateConstructor();
		// fix setting of constructor:
		sub.prototype.constructor = sub;
	};

	/**
	 * {@returns} the class name of the argument or {@code undefined} if it's not a valid JavaScript object.
	 * <p>
	 * See: http://blog.magnetiq.com/post/514962277/finding-out-class-names-of-javascript-objects
	 */
	this.objectClass = function(obj) {
		if( obj && obj.constructor && obj.constructor.toString ) {
			var arr = obj.constructor.toString().match(/function\s*(\w+)/m);	// FIXME  regexp doesn't work yet...

	        if( arr && arr.length == 2 ) {
	        	return arr[1];
	        }
	    }

	    return undefined;
	};

})();

