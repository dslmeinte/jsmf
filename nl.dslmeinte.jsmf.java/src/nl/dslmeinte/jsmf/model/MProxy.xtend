package nl.dslmeinte.jsmf.model

@Data
class MProxy {

	@Property Reference reference
	@Property MResource resource

	def get() {
		resource.lookup(reference.localId)
	}

}

@Data
class Reference {

	@Property	long localId

}

