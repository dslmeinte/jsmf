Road map
========

- MObject, or better: suitable factory functions, must be visible from outside jsmf.model.Resource.
- Feature-s have two characteristic, discrete axes: single/many-valued, attribute/containment/reference.
	Factor this in through inheritance.
- A many-valued Feature must have an jsmf.model.MList as "technical value", so we can implement the Observer pattern on the many-valued value as a whole.
	This is also a good route to implement bidirectionally-mutable lists (like in EMF).
- **TODO**  Compile suitable interfaces for the Observable part of MObject and MList.

