package nl.dslmeinte.jsmf.meta

interface MetaClassReference {

	def String name()

}


@Data
class TrueReference implements MetaClassReference {

	@Property MetaClass metaClass
	override name()	{ metaClass.name }

}


@Data
class NameReference implements MetaClassReference {

	@Property String metaClassName
	override name() { metaClassName }

}

