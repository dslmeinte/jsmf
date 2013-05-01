package nl.dslmeinte.jsmf.model

import java.util.List

class MList<T> extends MElement {

	new(MResource resource, MObject container) {
		super(resource, container)
	}

	public val List<T> list = newArrayList

	def get() {
		list.unmodifiableView
	}

	def toJSON() {
		throw new UnsupportedOperationException("TODO  auto-generated method stub")
	}

	// TODO  implement everything

}
