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

		var _self = this;	// for use in closures, to be able to access public features (can't do that through `this.`)

		// traverse values/settings of features:
		$.map(initData, function(value, key) {
			if( key !== '_class' ) {
				_self[key] = (function(feature) {
					switch(feature.kind) {
						case 'attribute':	return value;
						case 'containment':	return new jsmf.emf.EObject(value, feature.type);
						case 'reference':	return value;	// leave as "proxy", resolve later
					}
				})(eClass.allFeatures[key]);
			}
		});

		this.eGet = function(feature) {
			if( typeof(feature) === 'string' ) {
				return this[feature];
			}
			if( feature instanceof EFeature ) {
				return this[feature.name];
			}
			throw new Error('invalid feature argument to eGet');
		};

		this.eSet = function(feature, value) {
			if( typeof(feature) === 'string' ) {
				this[feature] = value;
			}
			if( feature instanceof EFeature ) {
				this[feature.name] = value;
			}
			throw new Error('invalid feature argument to eGet');
		};

		// TODO  add convenience function for traversal and such

	};

});

