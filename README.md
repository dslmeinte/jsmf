JSMF: JavaScript Modeling Framework
===================================

JSMF is intended to be an extremely light-weight (and thoroughly feature-incomplete, simplified) Javascript version of Ed Merks' EMF (Eclipse Modeling Framework).

It's primary purpose is to serve as the abstract syntax framework for models transported to a modified Concrete Model Editor (see mthiede/concrete and its fork dslmeinte/concrete) - instead of the current DOM-based approach that Concrete uses.
As such, it resembles an amalgamation of EMF and the JSON representations used by the Concrete Model Editor - in particular for the meta model, because of legacy reasons.

It currently uses jQuery (instead of Prototype.js) to help with collection operations, but I'm undecided whether this will remain the case or I think a completely independent framework is more useful.
In any case, not much of jQuery is actually used.


## Dependencies

JSMF is dependent on jQuery (comes with version 1.8.1), Apache ANT (at least version 1.6.3) and [QUnit](http://qunitjs.com/) for running some unit-like tests.

## Building

Run the <tt>build.xml</tt> ANT in the <tt>pre-build/</tt> folder to concatenate everything required into the <tt>jsmf.js</tt> file.

## Testing

Open the <tt>test/test.html</tt> file in a(ny) browser.

## Usage

Include the built <tt>jsmf.js</tt> and <tt>jquery-1.8.1.js</tt> files into your HTML file.

**TODO** explain how to instantiate <tt>EPackage</tt> and <tt>EResource</tt>.

