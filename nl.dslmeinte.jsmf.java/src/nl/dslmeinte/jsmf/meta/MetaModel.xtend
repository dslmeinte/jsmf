package nl.dslmeinte.jsmf.meta

import java.util.List
import java.util.Map
import java.util.Set
import nl.dslmeinte.jsmf.exceptions.GeneralException
import nl.dslmeinte.jsmf.util.LightWeightJSONUtil
import org.json.JSONArray
import org.json.JSONObject

class MetaModel {

	public val List<MetaType> types

	val Map<String, MetaType> typesMap = newHashMap

	def lookupType(String name) {
		typesMap.get(name)
	}

	def metaClassReference(String name) {
		switch type: typesMap.get(name) {
			case null:	new NameReference(name)
			MetaClass:	new TrueReference(type)
			default:	throw GeneralException::typing('''"«name»" is not a meta class''')
		}
	}

	new(JSONArray typesAsJSON) {
		this.types = typesAsJSON.map[ JSONObject it | unmarshalType ].unmodifiableView
	}

	def private unmarshalType(JSONObject json) {
		switch json.optString('metaMetaType') {
			case 'Datatype':	new MetaDatatype
			case 'Enum':		new MetaEnum => [
									literals = json.getJSONArray('literals').map[it as String]
								]
			case 'Class':		new MetaClass(this) => [
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
		new Feature => [
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

	def type(Feature it) {
		typeName.lookupType
	}


	val allSuperTypesMap = <MetaClass, Set<MetaClass>>newHashMap

	def Set<MetaClass> allSuperTypes(MetaClass metaClass) {
		var result = allSuperTypesMap.get(metaClass)

		if( result == null ) {
			result = metaClass.allSuperTypesInternal
			allSuperTypesMap.put(metaClass, result)
		}

		return result
	}

	def Set<MetaClass> allSuperTypesInternal(MetaClass it) {
		val result = <MetaClass>newLinkedHashSet	// store in a LinkedHashSet to preserve (somewhat)
		result.addAll(superTypes)
		result.addAll(superTypes.map[allSuperTypes].flatten)
		result
	}


	val allFeaturesMap = <MetaClass, List<Feature>>newHashMap

	def List<Feature> allFeatures(MetaClass metaClass) {
		var result = allFeaturesMap.get(metaClass)

		if( result == null ) {
			result = metaClass.allFeaturesInternal
			allFeaturesMap.put(metaClass, result)
		}

		return result
	}

	def private List<Feature> allFeaturesInternal(MetaClass it) {
		(allSuperTypes.map[features].flatten + features).toList
	}


	def Feature feature(MetaClass it, String name) {
		allFeatures.findFirst[ f | f.name == name ]
	}


	val allAnnotationsMap = <MetaClass, Set<String>>newHashMap

	def Set<String> allAnnotations(MetaClass metaClass) {
		var result = allAnnotationsMap.get(metaClass)

		if( result == null ) {
			result = metaClass.allAnnotationsInternal
			allAnnotationsMap.put(metaClass, result)
		}

		return result
	}

	def private allAnnotationsInternal(MetaClass it) {
		(allSuperTypes.map[annotationNames].flatten + annotationNames).toSet
	}

}
