package nl.dslmeinte.jsmf.migration

import nl.dslmeinte.jsmf.meta.FeatureKind
import nl.dslmeinte.jsmf.meta.MetaClass
import nl.dslmeinte.jsmf.meta.MetaFeature
import nl.dslmeinte.jsmf.meta.MetaModel
import nl.dslmeinte.jsmf.util.LightWeightJSONUtil
import org.json.JSONArray
import org.json.JSONObject

class ModelFormatMigrator {

	extension MetaModel metaModel

	public val JSONArray migratedModel

	new(MetaModel metaModel, JSONArray model) {
		this.metaModel = metaModel
		this.migratedModel = new JSONArray(model.map[migrateObject])
	}

	var localId = 0

	val simpleNameMap = <String, Integer>newHashMap

	def private JSONObject migrateObject(JSONObject o) {
		val metaTypeName = o.getString("_class")
		val metaClass = metaTypeName.lookupType as MetaClass
		new JSONObject => [
			localId = localId + 1
			put('localId', localId)

			val name = o.optString('name')
			if( !name.nullOrEmpty ) {
				simpleNameMap.put(name, localId)
			}

			put("metaType", metaTypeName)

			o.remove("_class")
			put("settings", o.transform[ key, s | migrateSetting(s, metaClass.feature(key)) ])
		]
	}

	def private migrateSetting(Object it, MetaFeature feature) {
		if( feature.kind == FeatureKind::reference ) {
			switch it {
				JSONArray:	map[(it as String).migrateSingleReference]
				String:		migrateSingleReference
				default:	throw new IllegalArgumentException('''cannot migrate the following as a reference #«feature.name»: «toString»''')
			}
		} else {
			switch it {
				JSONArray:	map[migrate]
				JSONObject:	migrateObject
				default:	it
			}
		}
	}

	def private Object migrate(Object it) {
		switch it {
			JSONArray:	map[migrate]
			JSONObject:	migrateObject
			default:	it
		}
	}

	def private migrateSingleReference(String refName) {
		new JSONObject => [
			val refId = simpleNameMap.get(refName)
			if( refId != null ) {
				put('localRefId', refId)
			}
			put('hint', refName)
		]
	}

	extension LightWeightJSONUtil = new LightWeightJSONUtil

}
