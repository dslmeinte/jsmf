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
		if( o.optString('metaType').nullOrEmpty ) {
			new JSONObject => [
				fixId(it, o)

				put('metaType', o.metaClass.name)
	
				o.remove('_class')

				put('settings', o.transform[ key, s |
					val feature = metaClass.feature(key)
					if( feature == null ) {
						throw new IllegalArgumentException('''no feature «metaClass.name»#«key» found''')
					}
					migrateSetting(s, metaClass.feature(key))
				])
			]
		} else {
			o => [ fixId(it) ]
		}
	}

	def private fixId(JSONObject newO, JSONObject oldO) {
		var effectiveLocalId = oldO.optInt('localId')
		if( effectiveLocalId == 0 ) {
			localId = localId + 1
			effectiveLocalId = localId
		}
		newO.put('localId', effectiveLocalId)

		val name = oldO.optString('name')
		if( !name.nullOrEmpty ) {
			simpleNameMap.put(name, effectiveLocalId)
		}
	}

	def private metaClass(JSONObject o) {
		var metaTypeName = o.optString('_class')
		if( metaTypeName.nullOrEmpty ) {
			metaTypeName = o.getString('metaType')
		}
		metaTypeName.lookupType as MetaClass
	}

	def private migrateSetting(Object it, MetaFeature feature) {
		if( feature.kind == FeatureKind::reference ) {
			switch it {
				JSONArray:	map[(it as String).migrateSingleReference]
				JSONObject:	migrateSingleReference
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

	def private migrateSingleReference(JSONObject it) {
		// already migrated, might have to fix
		it
	}

	extension LightWeightJSONUtil = new LightWeightJSONUtil

	// TODO  use a qualified name-strategy...

}
