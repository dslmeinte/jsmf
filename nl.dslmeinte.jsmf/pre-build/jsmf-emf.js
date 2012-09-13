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

		var _allFeatures = eClass.allFeatures();

		// traverse values/settings of features:
		$.map(initData, function(value, key) {
			if( key !== '_class' ) {
				_self[key] = (function(feature) {
					switch(feature.kind) {
						case 'attribute':	return value;
						case 'containment':	return createNestedObject(feature, value, function(_value, type) { return new jsmf.emf.EObject(_value, type); });
						case 'reference':	return createNestedObject(feature, value, function(_value, type) { return new EProxy(_value, type); });
					}
				})(_allFeatures[key]);
			}
		});

		function createNestedObject(feature, value, creationFunc) {
			if( $.isArray(value) ) {
				if( feature.upperLimit === 1 ) throw new Error('cannot load an array into the single-valued feature ' + feature.containingEClass.name + '#' + feature.name);
				return $.map(value, function(nestedValue, index) {
					return creationFunc.apply(this, [ nestedValue, feature.type ]);
				});
			}
			return creationFunc.apply(value, feature.type);
		}

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

		function EProxy(value, type) {
			this.value = value;
			this.type = type;
		}

	};

});

