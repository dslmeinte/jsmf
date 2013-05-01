package nl.dslmeinte.jsmf.model

import java.util.Map
import nl.dslmeinte.jsmf.meta.Feature
import nl.dslmeinte.jsmf.meta.MetaClassReference
import nl.dslmeinte.jsmf.meta.TrueReference
import org.json.JSONObject

@Data
class MObject {

	@Property MetaClassReference metaClassReference
	@Property long localId
	@Property MResource resource

	def private feature(String featureName) {
		switch metaClassReference {
			TrueReference: {
				val metaClass = (metaClassReference as TrueReference).metaClass
				metaClass.metaModel.feature(metaClass, featureName)
			}
			default: null
		}
	}

	private val Map<Feature, Setting<?>> settings = newHashMap
	private val Map<String, Object> faultySettings = newHashMap

	def <T extends MObject> get(String featureName) {
		switch feature: feature(featureName) {
			case null:	faultySettings.get(featureName)
			default: {
				switch setting: settings.get(feature) {
					case null:	null
					default: {
						setting.get => [
							switch setting {
								ProxySetting<T>: settings.put(feature, new ReferenceSetting<T>(it as T) as Setting<?>)
							}
						]
					}
				}
			}
		}
	}

	def <T> set(String featureName, T newValue) {
		switch feature: featureName.feature {
			case null:	faultySettings.put(featureName, newValue)
			default: {
				val oldSetting = settings.get(feature)
				val oldValue = oldSetting.get
				if( oldValue != newValue ) {
					settings.put(feature, resource.createSetting(feature, newValue) as Setting<?>)
				}
			}
		}
		this	// for chaining
	}


	val Map<String, Object> annotationSettings = newHashMap

	def getAnnotation(String annotationName) {
		annotationSettings.get(annotationName)
	}

	def setAnnotation(String annotationName, Object value) {
		annotationSettings.put(annotationName, value)
		this	// for chaining
	}


	def toJSON() {
		new JSONObject => [
			put('localId', localId)
			put('metaType', metaClassReference.name)
			switch metaClassReference {
				TrueReference: {
					val metaClass = (metaClassReference as TrueReference).metaClass
					put('settings', new JSONObject => [
						metaClass.metaModel.allFeatures(metaClass).forEach[ f |
							val setting = settings.get(f)
							if( setting != null ) {
								val convertedValue = setting.toJSON
								if( convertedValue != null ) {
									put(f.name, convertedValue)
								}
							}
						]
					])
				}
			}
			put('@settings', annotationSettings.toJSON)
			put('faultySettings', faultySettings.toJSON)
		]
	}

	def private toJSON(Map<String, Object> map) {
		new JSONObject => [ map.forEach[ key, value | put(key, value) ] ]
	}

}
