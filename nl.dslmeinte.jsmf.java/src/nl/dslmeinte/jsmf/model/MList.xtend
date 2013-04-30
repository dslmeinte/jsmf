package nl.dslmeinte.jsmf.model

import java.util.List

@Data
class MList<T> extends Setting<List<T>> {

	@Property List<T> list

	override get() {
		list.unmodifiableView
	}

	override set(List<T> value) {
		throw new UnsupportedOperationException("TODO  auto-generated method stub")
	}

	override toJSON() {
		throw new UnsupportedOperationException("TODO  auto-generated method stub")
	}

}
