package nl.dslmeinte.jsmf.model

import java.util.Map

abstract class Setting<T> {

	def T get()

	def void set(T value)

	// TODO  consider: in case of changing values, should the Setting or the containing MObject kick off notifications?

	def Object toJSON()

	protected val Map<String, ?> annotationSettings = newHashMap

	
}

@Data
class AttributeSetting<T> extends Setting<T> {

	@Property T value

	override get() {
		value
	}

	override set(T value) {
		throw new UnsupportedOperationException("TODO  auto-generated method stub")
	}
	
	override toJSON() {
		value
	}

}

@Data
class ContainmentSetting<T extends MObject> extends Setting<T> {

	@Property T value

	override get() {
		value
	}

	override set(T value) {
		throw new UnsupportedOperationException("TODO  auto-generated method stub")
	}

	override toJSON() {
		throw new UnsupportedOperationException("TODO  auto-generated method stub")
	}

}

@Data
class ReferenceSetting<T extends MObject> extends Setting<T> {

	@Property T value

	override get() {
		value
	}

	override set(T value) {
		throw new UnsupportedOperationException("TODO  auto-generated method stub")
	}

	override toJSON() {
		throw new UnsupportedOperationException("TODO  auto-generated method stub")
	}

}

@Data
class ProxySetting<T extends MObject> extends Setting<T> {

	@Property Reference reference
	@Property MResource resource

	override get() {
		resource.lookup(reference.localId)
	}

	override set(T value) {
		throw new UnsupportedOperationException("TODO  auto-generated method stub")
	}

	override toJSON() {
		throw new UnsupportedOperationException("TODO  auto-generated method stub")
	}

}

@Data
class Reference {

	@Property	long localId

}

