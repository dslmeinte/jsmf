/*
 * This corresponds to the pure/base part of EMF.
 * 
 * (c) 2012 Meinte Boersma
 */


jsmf.emf = new (function() {

	this.createEResource = function(modelJSON, ePackage) {	/* (somewhat) analogous to org.eclipse.emf.ecore.resource.Resource (or rather: org.eclipse.emf.ecore.resource.impl.ResourceImpl) */

		var eResource = new EResource(ePackage);

		if( !$.isArray(modelJSON) ) throw new Error('model JSON is not an array of objects');
		$(modelJSON).each(function(index) {
			if( typeof(this) !== 'object' ) throw new Error('non-Object encountered within model JSON array: index=' + index);
			jsmf.util.checkClass(this);
			var className = this['_class'];
			var eClass = ePackage.classifiers[className];
			if( eClass == undefined ) throw new Error("declared object's type " + className + " is not known in meta model");
			eResource.contents.push(new jsmf.emf.EObject(this, eClass));
		});

		// TODO  load initData into contents, taking care of references and checking model contents against the meta model represented by the given ePackage

		return eResource;

	};

	function EResource(ePackage) {
		this.ePackage = ePackage;
		this.contents = [];
	}

	this.EObject = function(initData, eClass) {	/* analogous to org.eclipse.emf.ecore.EObject (or org.eclipse.emf.ecore.impl.EObjectImpl / DynamicEObjectImpl) */

		this._eClass = eClass;

		var validPropertyNames = [ "_class" ].concat(eClass.annotations).concat($.map(eClass.features, function(k, v) { return k; }));
		jsmf.util.checkProperties(initData, validPropertyNames);

		var self = this;	// for use in closures, to be able to access public features (can't do that through `this.`)
		$.map(initData, function(value, key) {
			if( key !== '_class' ) {
				self[key] = value;
			}
			// TODO  check (and throwing an Error) for illegal names (like update and such) and whether eClass def. matches the initialisation data
		});

		// TODO  add convenience function for traversal and such (in prototype?)

		// TODO  add hooks for adapters/annotations to be able to cope with documentation and view info in a meaningful way

	};

});

