package nl.dslmeinte.jsmf.model

import java.util.List

class MList extends MElement {

	new(MResource resource, MObject container) {
		super(resource, container)
	}

	public val List<Object> list = newArrayList

	def get() {
		list.unmodifiableView
	}

	// TODO  implement everything

}
