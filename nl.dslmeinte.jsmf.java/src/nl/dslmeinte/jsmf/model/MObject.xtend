package nl.dslmeinte.jsmf.model

import java.util.Map
import nl.dslmeinte.jsmf.exceptions.GeneralException
import nl.dslmeinte.jsmf.meta.Feature
import nl.dslmeinte.jsmf.meta.FeatureKind
import nl.dslmeinte.jsmf.meta.MetaClassReference
import nl.dslmeinte.jsmf.meta.TrueReference
import nl.dslmeinte.jsmf.util.LightWeightJSONUtil
import org.json.JSONArray
import org.json.JSONObject
import org.json.JSONType

import static nl.dslmeinte.jsmf.meta.FeatureKind.*

class MObject extends MElement {

	public val MetaClassReference metaClassReference
	public val long localId

	new(MetaClassReference metaClassReference, long localId, MResource resource, MObject container) {
		super(resource, container)
		this.metaClassReference = metaClassReference
		this.localId = localId
	}

	def private feature(String featureName) {
		switch metaClassReference {
			TrueReference: {
				val metaClass = metaClassReference.metaClass
				metaClass.metaModel.feature(metaClass, featureName)
			}
			default: null
		}
	}


	val Map<Feature, Object> settings = newHashMap
	val Map<String, Object> faultySettings = newHashMap

	def <T> T get(String featureName) {
		switch feature: feature(featureName) {
			case null:	faultySettings.get(featureName)
			default: {
				switch value: settings.get(feature) {
					MProxy:		settings.put(feature, value.resolve)
					default:	value
				}
			}
		} as T
	}

	extension LightWeightJSONUtil = new LightWeightJSONUtil

	def set(String featureName, Object newValue) {
		switch feature: featureName.feature {
			case null:	faultySettings.put(featureName, newValue)
			default: {
				val oldValue = settings.get(feature)
				if( oldValue != newValue ) {
					settings.put(feature,
						if( feature.manyValued ) {
							switch newValue {
								MList:				newValue
								JSONArray:			new MList(resource, this) => [ addAll(newValue.map[createSingleValuedSetting(feature, it)]) ]
								Iterable<Object>:	new MList(resource, this) => [ addAll(newValue.map[createSingleValuedSetting(feature, it)]) ]
								default:			throw GeneralException::typing('''cannot set feature ''')
							}
						} else {
							createSingleValuedSetting(feature, newValue)
						}
					)
				}
			}
		}
		this	// for chaining
	}

	def <T> createSingleValuedSetting(Feature feature, T value) {
		switch feature.kind {
			case attribute: {
				switch value {
					String: 	{ /* OK */ }
					Long:		{ /* OK */ }
					Integer:	{ /* OK */ }
					Float:		{ /* OK */ }
					Double:		{ /* OK */ }
					Boolean:	{ /* OK */ }
					default:	throw GeneralException::typing('''cannot assign an instance of «value.^class.name» to attribute "«feature.name»"''')
				}
				value
			}
			case containment: {
				switch value {
					MObject:	value
					default:	throw GeneralException::typing('''containment feature "«feature.name»" can only hold MObjects, not «value.^class.name»s''')
				}
			}
			case reference: {
				switch value {
					JSONObject:		new MProxy(new Reference(value.getLong('localRefId')), resource)
					MProxy:			value.resolve
					MObject:		value
					default:		throw GeneralException::typing('''reference feature "«feature.name»" can only hold MObjects, not «value.^class.name»s''')
				}
			}
		}
	}


	val Map<String, Object> annotationSettings = newHashMap

	def getAnnotation(String annotationName) {
		annotationSettings.get(annotationName)
	}

	def setAnnotation(String annotationName, Object value) {
		annotationSettings.put(annotationName, value)
		this	// for chaining
	}


	def JSONType toJSON() {
		new JSONObject => [
			put('localId', localId)
			put('metaType', metaClassReference.name)
			switch metaClassReference {
				TrueReference: {
					val metaClass = metaClassReference.metaClass
					put('settings', new JSONObject => [
						metaClass.metaModel.allFeatures(metaClass).forEach[ f |
							val value = settings.get(f)
							if( value !== null ) {
								put(f.name, value.toJSON_(f.kind == FeatureKind::reference))
							}
						]
						faultySettings.forEach[ key, value | put(key, value) ]
					])
				}
			}
			if( !annotationSettings.empty ) {
				put('@settings', new JSONObject => [ annotationSettings.forEach[ key, value | put(key, value) ] ])
			}
		]
	}


	def private Object toJSON_(Object o, boolean isReference) {
		switch o {
			JSONType:	o
			MObject: {
				if( isReference ) {
					new JSONObject => [ put('localRefId', o.localId) ]
				} else {
					o.toJSON
				} 
			}
			MList:		new JSONArray => [ a | o.get.forEach[ i | a.put(i.toJSON_(isReference))] ]
			default:	o
		}
	}

	override hashCode() { localId.hashCode }

	override equals(Object that) {
		switch that {
			MObject:	localId == that.localId
			default:	false
		}
	}

	override toString() {
		'''MObject[«localId»|«metaClassReference.name»]'''
	}

}
