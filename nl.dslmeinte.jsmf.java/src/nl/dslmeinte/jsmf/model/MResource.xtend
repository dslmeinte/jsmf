package nl.dslmeinte.jsmf.model

import java.util.Map
import nl.dslmeinte.jsmf.exceptions.GeneralException
import nl.dslmeinte.jsmf.meta.MetaModel
import nl.dslmeinte.jsmf.util.LightWeightJSONUtil
import org.json.JSONArray
import org.json.JSONObject

class MResource {

	val MetaModel metaModel

	extension LightWeightJSONUtil = new LightWeightJSONUtil

	new(MetaModel metaModel, JSONArray modelJSON) {
		this.metaModel = metaModel
		contents.addAll(modelJSON.map[unmarshal(null)])
	}

	public val MList contents = new MList(this, null)

	val Map<Long, MObject> idMap = newHashMap

	def <T> T lookup(long id) {
		if( !idMap.containsKey(id) ) {
			throw GeneralException::format('''object with id=«id» not in this resource''')
		}
		return idMap.get(id) as T
	}


	def private dispatch Object unmarshal(JSONObject it, MObject container) {
		if( opt('metaType') != null ) {
			unmarshalMObject(container)
		} else if( opt('localRefId') != null ) {
			unmarshalMProxy
		} else {
			GeneralException::format("don't know how to unmarshal the following JSONObject: " + toString(2))
		}
	}

	def private dispatch Object unmarshal(JSONArray it, MObject container) {
		map[unmarshal(container)]
	}

	def private dispatch Object unmarshal(Object it, MObject container) {
		it
	}


	def private unmarshalMObject(JSONObject it, MObject container) {
		val metaTypeName = optString('metaType')

		val localId = optLong('localId')
		if( localId == 0 ) {
			throw GeneralException::format('''object has no declared local id: «toString(2)»''')
		}
		val metaClassReference = metaModel.metaClassReference(metaTypeName)

		val mObject = new MObject(metaClassReference, localId, this, container)

		if( idMap.containsKey(localId) ) {
			throw GeneralException::format('''duplicate local id encountered: «localId»''')
		}
		idMap.put(localId, mObject)

		getJSONObject('settings').forEach[ fName, value | mObject.set(fName, value.unmarshal(mObject)) ]
		optJSONObject('@settings')?.forEach[ fName, value | mObject.setAnnotation(fName, value) ]

		mObject
	}

	def private unmarshalMProxy(JSONObject it) {
		new MProxy(new Reference(getLong('localRefId')), this)
	}


	def toJSON() {
		new JSONArray( contents.get.map[(it as MObject).toJSON] )
	}

}


@Data
abstract class MElement {

	@Property MResource resource
	@Property MObject container
		// TODO  container can also be an MList, in which case a reference to that + an index is more productive
		// TODO  reference to a feature is also helpful, but need to take invalid data-scenario into account

}

