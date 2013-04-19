JSMF: JavaScript Modeling Framework
===================================

JSMF is intended to be an extremely light-weight (and thoroughly feature-incomplete, simplified) Javascript version of Ed Merks' EMF (Eclipse Modeling Framework).

It's primary purpose is to serve as the abstract syntax framework for models transported to a modified Concrete Model Editor (see mthiede/concrete and its fork dslmeinte/concrete) - instead of the current DOM-based approach that Concrete uses.
As such, it resembles an amalgamation of EMF and the JSON representations used by the Concrete Model Editor - in particular for the meta model, because of legacy reasons.

It currently uses jQuery (instead of Prototype.js) to help with collection operations, but I'm undecided whether this will remain the case or I think a completely independent framework is more useful.
In any case, not much of jQuery is actually used.


## Dependencies

JSMF is dependent on jQuery (comes with version 1.8.2), Apache ANT (at least version 1.6.3) for making a build and [QUnit](http://qunitjs.com/) for running some unit-like tests.

## Building

Run the <tt>build.xml</tt> ANT in the <tt>pre-build/</tt> folder to concatenate everything required into the <tt>jsmf.js</tt> file.

## Testing

Open the <tt>test/test-deserialization.html</tt> file in a(ny) browser.

## Usage

Include the built <tt>jsmf.js</tt> and <tt>jquery-1.8.1.js</tt> files into your HTML file.

**TODO** explain how to instantiate <tt>EPackage</tt> and <tt>EResource</tt>.

## Formats

JSMF uses two JSON formats for interchange of meta models and models.
These are solely intended for transport so they offer nothing in the way of human-readability (such as autogeneration of IDs) and deserialization fails early (and hard) on syntax errors, i.e. JSON not adhering to the format's schema.
However, the model format offers a certain level of fail-soft behavior in the sense that data that's syntactically correct, but does not adhere to the meta model is stored in the model in a way that allows retrieval.
The formats are described below, but neither the description nor their implementation is currently complete.


### Meta model format

Example:
```
...
```

### Model format

Each object has the following descriptive structure:
```
{
	metaType: 'some meta type name',
	(localId: 'a locally-unique id',)
	settings: {
		'name': 'whatever',
		...
	},
	'@settings': {
		'view': { ... }
	}
}
```
This structure is a little more verbose than a direct dictionary but also less brittle and it allows explicit inclusion of annotation settings.

The model overall has the following serializaton (currently only partly implemented):
```
{

	modelId: 'a globally-unique id',
	metaModelId: 'asset-id of the meta model',
	( /* version info? */ ),
	( /* includes? */
	rootElement: {
		...
	}

}
```
There's really no reason to not have a single (potentially unnamed) root element, instead of a collection of them.
Also, having a single root element makes rendering and validation at that level completely analogous to other levels.


#### References

Model elements are referenced by an GUID which is composed from a local ID and a asset ID (as a pure pair - no concatenation!).
The thinking (design decision) behind this is that lookup based on names and/or locations is quite brittle since names and locations (e.g. index in a list) change.
That lookup is also potentially expensive since we need to traverse the structure upwards to compute (qualified) names or URI strings etc.

A reference within a model is a JS object of the following form:

```
{
	localId:	'a referred id' //, or
	remoteId:	'a GUID, separate from localId?'
	/* or:
		{ modelId: 'id of a the model containing the referenced local ID', 'localId': 'ID of referenced element with the specified model' }
	 */
	(, hint: 'a hint for resolution e.g. a (qualified) name or URI string or whatever')
}
```

**Note to self** Explicit mention of modelId prevents location-Refactoring across models!

The hint is non-authorative and should only be used for testing and such.
It's only meant as a more semantic way of expressing the reference without requiring the mechanism to be completely implemented (or even implementable).
It can also be used as the base for an alternative resolution strategy.

