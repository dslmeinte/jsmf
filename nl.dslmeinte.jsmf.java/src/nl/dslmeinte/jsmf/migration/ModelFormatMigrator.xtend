package nl.dslmeinte.jsmf.migration

import nl.dslmeinte.jsmf.meta.Feature
import nl.dslmeinte.jsmf.meta.FeatureKind
import nl.dslmeinte.jsmf.meta.MetaClass
import nl.dslmeinte.jsmf.meta.MetaModel
import nl.dslmeinte.jsmf.util.LightWeightJSONUtil
import org.json.JSONArray
import org.json.JSONObject
import org.json.JSONType

class ModelFormatMigrator {

	extension MetaModel metaModel

	public val JSONArray migratedModel

	new(MetaModel metaModel, JSONArray model) {
		this.metaModel = metaModel
		println('''migrating model''')
		this.migratedModel = new JSONArray(model.map[migrateObject])
		new ModelTraversal[resolveReference].handleAndRecurse(this.migratedModel)
		println('''...done''')
	}

	var localId = 0


	val simpleNameMap = <Integer, String>newHashMap

	def idBySimpleName(String name) {
		simpleNameMap.entrySet.findFirst[ name == value ]?.key
	}


	val qualifiedNameMap = <String, Integer>newHashMap

	def qualifiedNameMap() {
		qualifiedNameMap.unmodifiableView
	}


	def private JSONObject migrateObject(JSONObject o) {
		if( o.optString('metaType').nullOrEmpty ) {
			new JSONObject => [
				fixId(it, o)

				put('metaType', o.metaClass.name)
	
				o.remove('_class')

				put('settings', o.transform[ key, s |
					if( key != '_view' ) {
						migrateSetting(s, key)
					}
				])

				val viewInfo = o.optJSONObject('_view')
				if( viewInfo != null ) {
					put('@settings', new JSONObject => [ put('_view', viewInfo) ])
				}
			]
		} else {
			// TODO  make a deep copy with the localId at the first position instead of fixing the id
			o => [
				fixId(it)
				getJSONObject('settings').forEach[ key, s | migrateSetting(s, key) ]
			]
		}
	}

	def private migrateSetting(JSONObject it, Object setting, String featureName) {
		val feature = metaClass.feature(featureName)
		if( feature == null ) {
			throw new IllegalArgumentException('''no feature «metaClass.name»#«featureName» found''')
		}
		migrateSetting(setting, feature)
	}

	def private void fixId(JSONObject newO, JSONObject oldO) {
		var effectiveLocalId = oldO.optInt('localId')
		if( effectiveLocalId == 0 ) {
			localId = localId + 1
			effectiveLocalId = localId
		}
		newO.put('localId', effectiveLocalId)

		val name = oldO.name
		if( !name.nullOrEmpty ) {
			simpleNameMap.put(effectiveLocalId, name)
			val qName = oldO.qualifiedName
			qualifiedNameMap.put(qName, effectiveLocalId)
			println('''	«effectiveLocalId» -> «name» | «qName»''')
		}
	}

	def private metaClass(JSONObject o) {
		var metaTypeName = o.optString('_class')
		if( metaTypeName.nullOrEmpty ) {
			metaTypeName = o.getString('metaType')
		}
		metaTypeName.lookupType as MetaClass
	}

	def private migrateSetting(Object it, Feature feature) {
		if( feature.kind == FeatureKind::reference ) {
			switch it {
				JSONArray:	map[
								switch it {
									String:		migrateSingleReference
									default:	it
								}
							]
				JSONObject:	migrateSingleReference
				String:		migrateSingleReference
				default:	throw new IllegalArgumentException('''cannot migrate the following as a reference #«feature.name»: «toString»''')
			}
		} else {
			migrate
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
			put('hint', refName)
		]
	}

	def private migrateSingleReference(JSONObject it) {
		// already migrated, might have to fix
		it
	}

	extension LightWeightJSONUtil = new LightWeightJSONUtil


	def private name(JSONObject it) {
		switch name_: optString('name') {
			case name_.nullOrEmpty:	{
				switch settings: optJSONObject('settings') {
					case null:		null
					default:		settings.optString('name')
				}
			}
			default:				name_
		}
	}

	def private qualifiedName(JSONObject it) {
		var JSONType current = it
		var qName = prefixedOptionalName
		while( current.container != null ) {
			current = current.container		// != null
			switch current {
				JSONObject:	qName = current.prefixedOptionalName + qName
				default:	{ /* do nothing */ }
			}
		}
		qName
	}

	def private prefixedOptionalName(JSONObject it) {
		switch optName: name {
			case optName.nullOrEmpty:	""
			default:					"/" + optName
		}
	}


	def private void resolveReference(JSONObject it) {
		if( optInt('localRefId') == 0 ) {
			val refName = optString('hint')
			if( !refName.nullOrEmpty && optString('metaType').nullOrEmpty ) {	// it's a reference
				val refId = qualifiedNameMap.get(refName) ?: idBySimpleName(refName)
				if( refId == null ) {
					println('''	couldn't install reference: «refName»''')
				} else {
					put('localRefId', refId)
					remove('hint')
					println('''	installed local ref-id «refId» -> «refName»''')
				}
			}
		}
	}

}
