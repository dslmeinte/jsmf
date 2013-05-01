package nl.dslmeinte.jsmf.model

import com.google.inject.Inject
import java.util.Map
import nl.dslmeinte.jsmf.exceptions.GeneralException
import nl.dslmeinte.jsmf.meta.Feature
import nl.dslmeinte.jsmf.meta.MetaModel
import nl.dslmeinte.jsmf.util.LightWeightJSONUtil
import nl.dslmeinte.xtend.annotations.ClassParameter
import nl.dslmeinte.xtend.annotations.Getter
import nl.dslmeinte.xtend.annotations.Initialisation
import nl.dslmeinte.xtend.annotations.ParametrizedInjected
import org.json.JSONArray
import org.json.JSONObject

import static nl.dslmeinte.jsmf.meta.FeatureKind.*

@ParametrizedInjected
class MResource {

	@ClassParameter @Getter MetaModel metaModel
	@ClassParameter JSONArray modelJson

	@Inject extension LightWeightJSONUtil

	@Initialisation
	def initialise() {
		modelJson.map[createMObject]
	}

	@Getter val MList<MObject> contents = new MList<MObject>(this, null, null)

	val Map<Long, MObject> idMap = newHashMap

	def <T> T lookup(long id) {
		if( !idMap.containsKey(id) ) {
			throw GeneralException::format('''object with id=«id» not in this resource''')
		}
		return idMap.get(id) as T
	}

	def <T> createSetting(Feature feature, T value) {
		switch feature.kind {
			case attribute:		new AttributeSetting(value)
			case containment:	new ContainmentSetting(value as MObject)
			case reference: {
				switch value {
					Long:					new ProxySetting(new Reference(value), this)
					ProxySetting<MObject>:	value
					default:				new ReferenceSetting(value as MObject)
				}
			}
		}
	}


	def private dispatch createMObject(JSONObject it) {
		val metaTypeName = optString('metaType')
		if( metaTypeName.nullOrEmpty ) {
			throw GeneralException::format('''object has no declared meta type''')
		}
		val localId = optLong('localId')
		if( localId == 0 ) {
			throw GeneralException::format('''object has no declared local id''')
		}
		val metaClassReference = metaModel.metaClassReference(metaTypeName)

		val mObject = new MObject(metaClassReference, localId, this)

		if( idMap.containsKey(localId) ) {
			throw GeneralException::format('''duplicate local id encountered: «localId»''')
		}
		idMap.put(localId, mObject)
		contents.list.add(mObject)
	}

	def private dispatch createMObject(Object it) {
		throw GeneralException::format("cannot create an MObject from a non-(JSON)Object")
	}

}
