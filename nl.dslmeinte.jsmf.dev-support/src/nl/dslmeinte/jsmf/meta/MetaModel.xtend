package nl.dslmeinte.jsmf.meta

import java.io.InputStream
import java.util.List
import java.util.Map
import java.util.Set
import nl.dslmeinte.jsmf.util.LightWeightJSONUtil
import org.json.JSONArray
import org.json.JSONObject
import org.json.JSONTokener

class MetaModel {

	public List<MetaType> types

	val Map<String, MetaType> typesMap = newHashMap

	def private lookupType(String name) {
		typesMap.get(name)
	}

	new(InputStream inputStream) {
		val typesAsJSON = new JSONArray(new JSONTokener(inputStream))
		val types = <MetaType>newArrayList
		for( i : 0..(typesAsJSON.length -1) ) {
			types += typesAsJSON.getJSONObject(i).unmarshalType
		}
		this.types = types.unmodifiableView
	}

	def private unmarshalType(JSONObject json) {
		switch json.getString('metaMetaType') {
			case 'Datatype':	new MetaDatatype
			case 'Enum':		new MetaEnum => [
									literals = json.getJSONArray('literals').map[it as String]
								]
			case 'Class':		new MetaClass => [
									abstract = json.optBoolean('abstract')
									superTypeNames = json.optJSONArray('superTypes')?.map[it as String] ?: emptyList
									features = json.optJSONArray('features')?.map[unmarshalFeature] ?: emptyList
								]
		} => [
			name = json.getString('name')
			typesMap.put(name, it)
		]
	}

	def private unmarshalFeature(JSONObject json) {
		new MetaFeature => [
			name = json.getString('name')
			kind = FeatureKind::valueOf(json.getString('kind'))
			required = json.optBoolean('required')
			manyValued = json.optBoolean('manyValued')
			typeName = json.getString('type')
		]
	}

	extension LightWeightJSONUtil = new LightWeightJSONUtil

	def superTypes(MetaClass it) {
		superTypeNames.map[lookupType as MetaClass].toList
	}

	def type(MetaFeature it) {
		typeName.lookupType
	}


	val allSuperTypesMap = <MetaClass, Set<MetaClass>> newHashMap

	def Set<MetaClass> allSuperTypes(MetaClass it) {
		var result = allSuperTypesMap.get(it)

		if( result == null ) {
			result = <MetaClass>newLinkedHashSet
			result.addAll(superTypes)
			result.addAll(superTypes.map[allSuperTypes])
		}

		return result
	}

	def List<MetaFeature> allFeatures(MetaClass it) {
		(allSuperTypes.map[features].flatten.toList + features).toList
	}

}
