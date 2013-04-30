package nl.dslmeinte.jsmf.model

import java.util.Map
import nl.dslmeinte.jsmf.meta.Feature
import nl.dslmeinte.jsmf.meta.MetaModel
import nl.dslmeinte.xtend.annotations.ClassParameter
import nl.dslmeinte.xtend.annotations.Getter
import nl.dslmeinte.xtend.annotations.Initialisation
import nl.dslmeinte.xtend.annotations.ParametrizedInjected
import org.json.JSONArray

import static nl.dslmeinte.jsmf.meta.FeatureKind.*

@ParametrizedInjected
class MResource {

	@ClassParameter MetaModel metaModel
	@ClassParameter JSONArray modelJson

//	@Inject extension LightWeightJSONUtil

	@Initialisation
	def initialise() {
		modelJson
	}

	@Getter val MList<?> contents = new MList<MObject>(null)

	val Map<Long, MObject> idMap = newHashMap

	def <T> T lookup(long id) {
		if( !idMap.containsKey(id) ) {
			throw new RuntimeException('''object with id=«id» not in this resource''')
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

}
