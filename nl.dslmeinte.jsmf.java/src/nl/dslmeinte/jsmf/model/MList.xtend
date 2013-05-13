package nl.dslmeinte.jsmf.model

import java.util.List

class MList extends MElement {

	new(MResource resource, MObject container) {
		super(resource, container)
	}

	val List<Object> list = newArrayList

	def get() {
		list.unmodifiableView
	}

	def at(int index) {
		list.get(index)
	}

	def void add(Object value) {
		list += value
	}

	def void addAll(Iterable<Object> values) {
		list += values
	}

	def void removeValue(int index) {
		list.remove(index)
	}

	def <T> T first() {
		list.get(0) as T
	}

}
