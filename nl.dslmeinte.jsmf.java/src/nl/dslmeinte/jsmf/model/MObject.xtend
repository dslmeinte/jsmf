package nl.dslmeinte.jsmf.model

import java.util.Map
import nl.dslmeinte.jsmf.meta.Feature
import nl.dslmeinte.jsmf.meta.MetaClassReference
import nl.dslmeinte.jsmf.meta.TrueReference
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
				val metaClass = (metaClassReference as TrueReference).metaClass
				metaClass.metaModel.feature(metaClass, featureName)
			}
			default: null
		}
	}

	val Map<Feature, Object> settings = newHashMap
	val Map<String, Object> faultySettings = newHashMap

	def <T extends MObject> get(String featureName) {
		switch feature: feature(featureName) {
			case null:	faultySettings.get(featureName)
			default: {
				switch value: settings.get(feature) {
					MProxy:		settings.put(feature, value.get)
					default:	value
				}
			}
		}
	}

	def <T> set(String featureName, T newValue) {
		switch feature: featureName.feature {
			case null:	faultySettings.put(featureName, newValue)
			default: {
				val oldValue = settings.get(feature)
				if( oldValue != newValue ) {
					settings.put(feature, createSetting(feature, newValue))
				}
			}
		}
		this	// for chaining
	}

	def <T> createSetting(Feature feature, T value) {
		switch feature.kind {
			// TODO  implement MList coercion for many-valued, type checking and requiredness checking
			case attribute:		value
			case containment:	value
			case reference: {
				switch value {
					Long:		new MProxy(null, resource)
					MProxy:		value.get
					default:	value
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
					val metaClass = (metaClassReference as TrueReference).metaClass
					put('settings', new JSONObject => [
						metaClass.metaModel.allFeatures(metaClass).forEach[ f |
							val value = settings.get(f)
							if( value != null ) {
								put(f.name, value.toJSON_)
							}
						]
						faultySettings.forEach[ key, value | put(key, value) ]
					])
				}
			}
			put('@settings', new JSONObject => [ annotationSettings.forEach[ key, value | put(key, value) ] ])
		]
	}


	def private toJSON_(Object it) {
		switch it {
			JSONType:	it
			MObject:	toJSON
			MList<?>:	new JSONArray => [ a | list.forEach[ i | a.put(i)] ]
			default:	it
		}
	}

	override hashCode() { localId.hashCode }
	
	override equals(Object that) {
		switch that {
			MObject:	localId == that.localId
			default:	false
		}
	}

}
