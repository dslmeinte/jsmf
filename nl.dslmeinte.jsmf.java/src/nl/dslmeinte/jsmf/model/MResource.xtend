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
		contents.list.addAll( modelJSON.map[createMObject(null)] )
	}

	public val MList<MObject> contents = new MList<MObject>(this, null)

	val Map<Long, MObject> idMap = newHashMap

	def <T> T lookup(long id) {
		if( !idMap.containsKey(id) ) {
			throw GeneralException::format('''object with id=«id» not in this resource''')
		}
		return idMap.get(id) as T
	}

	def private dispatch createMObject(JSONObject it, MObject container) {
		val metaTypeName = optString('metaType')
		if( metaTypeName.nullOrEmpty ) {
			throw GeneralException::format('''object has no declared meta type''')
		}
		val localId = optLong('localId')
		if( localId == 0 ) {
			throw GeneralException::format('''object has no declared local id''')
		}
		val metaClassReference = metaModel.metaClassReference(metaTypeName)

		val mObject = new MObject(metaClassReference, localId, this, container)

		if( idMap.containsKey(localId) ) {
			throw GeneralException::format('''duplicate local id encountered: «localId»''')
		}
		idMap.put(localId, mObject)
		contents.list.add(mObject)

		getJSONObject('settings').forEach[ key, value | mObject.set(key, value) ]
		optJSONObject('@settings')?.forEach[ key, value | mObject.setAnnotation(key, value) ]

		mObject
	}

	def private dispatch /* declare as: */ MObject /* (otherwise inferred as Object) */ createMObject(Object it, MObject container) {
		throw GeneralException::format("cannot create an MObject from a non-(JSON)Object")
	}

}


@Data
abstract class MElement {

	@Property MResource resource
	@Property MObject container

}

