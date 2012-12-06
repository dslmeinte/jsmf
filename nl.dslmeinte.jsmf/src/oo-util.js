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
	 * 	SuperClass.call(this, initData);
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

})();

