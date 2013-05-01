package nl.dslmeinte.jsmf.model

import java.util.List
import nl.dslmeinte.jsmf.meta.Feature

@Data
class MList<T> {

	@Property MResource resource
	@Property MObject container
	@Property Feature feature

	val List<T> list = newArrayList

	def get() {
		list.unmodifiableView
	}

	def toJSON() {
		throw new UnsupportedOperationException("TODO  auto-generated method stub")
	}

}
