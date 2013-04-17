package nl.dslmeinte.jsmf

import nl.dslmeinte.jsmf.meta.MetaModel
import nl.dslmeinte.jsmf.util.LightWeightJSONUtil
import org.json.JSONArray
import org.json.JSONObject

class ModelFormatMigrator {

	extension MetaModel metaModel

	new(MetaModel metaModel) {
		this.metaModel = metaModel
	}

	def migrateModel(JSONArray it) {
		new JSONArray(map[migrateObject])
	}

	def private migrateObject(JSONObject o) {
		new JSONObject => [
			put("metaType", o.getString("_class"))
			o.remove("_class")
			put("settings", o.transform[migrate])
				// TODO  transform reference as well
		]
	}

	def private Object migrate(Object it) {
		switch it {
			JSONArray:	map[migrate]
			JSONObject:	migrateObject
			default:	it
		}
	}

	extension LightWeightJSONUtil = new LightWeightJSONUtil

}
