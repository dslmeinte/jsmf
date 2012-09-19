/*
 * A separate JS "module" for reasoning about paths/URIs within resources
 * to point at contained objects.
 * 
 * (c) 2012 Meinte Boersma
 */


jsmf.resolver = new (function() {

	// TODO  fix implementation of regex check
//	var uriRegExp = /^(\/\w+(\.\w+)?)*\/\w+$/g;
//	uriRegExp.compile();

	/**
	 * {code path} is a string in the format
	 * 		"/name1(.feature1)?/name2(.feature2)?/.../name$n$"
	 * indicating the path from the EResource's root to the target.
	 * (feature$n$ is missing since we don't descend into a feature anymore)
	 * All features are optional, since we can just traverse all (many-valued?)
	 * features of containment type. This is a nod to the current Concrete format -
	 * in general, I'd like to make the features required.
	 * 
	 * Note: we need a generic format (such as this one) or we need to implement
	 * custom resolution for every EPackage - which isn't useful on the M2 level,
	 * only on the level of the actual, concrete syntax of the language (== M0 + behavior).
	 */
	this.createUri = function(uriString) {
		if( typeof(uriString) !== 'string' ) throw new Error('URI must be a String');
//		if( !uriRegExp.test(uriString) ) throw new Error('URI must have the correct format: ' + uriString);
		var _fragments = uriString.slice(1).split('/');
		var uri = new Uri();
		uri.completeUri = uriString;
		$(_fragments).each(function(i) {		// this is a String
			var splitFragment = this.split('.');
			uri.fragments[i] = new uri.Fragment(splitFragment[0], ( splitFragment.length === 1 ? null : splitFragment[1] ));
		});
		return uri;
	};

	function Uri() {

		this.completeUri = null;

		this.fragments = [];

		this.Fragment = function(_name, _featureName) {

			this.name = _name;
			this.featureName = _featureName;	// may be null/undefined

			this.toString = function() {
				return( this.name + ( this.featureName == null ? '' : ( '.' + this.featureName ) ) );
			};

		};

		this.resolveInResource = function(resource) {
			var searchListOrObject = resource.contents;
			$(this.fragments).each(function(index) {	// this is a Fragment
				searchListOrObject = findIn(this, searchListOrObject);
				if( searchListOrObject == null ) throw new Error('could not resolve reference to object with fragment=' + this.toString() + ' (index=' + index + ')' );
				if( this.featureName ) {
					searchListOrObject = searchListOrObject.get(this.featureName);
				}
			});

			return searchListOrObject;

			function findIn(fragment, list) {
				var match = null;
				$(list).each(function(i) {
					if( this.name && this.name === fragment.name ) {
						match = this;
					}
				});
				return match;
			}

		};

	}

})();

