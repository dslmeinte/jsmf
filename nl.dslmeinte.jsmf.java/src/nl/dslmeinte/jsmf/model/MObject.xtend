package nl.dslmeinte.jsmf.model

import java.util.Map
import nl.dslmeinte.jsmf.meta.Feature
import nl.dslmeinte.jsmf.meta.MetaClass
import org.json.JSONObject

@Data
class MObject {

	@Property MetaClass metaClass
	@Property long localId
	@Property MResource resource

	public val Map<Feature, Setting<?>> settings = newHashMap

	def <T extends MObject> get(Feature feature) {
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

	def <T> set(Feature feature, T newValue) {
		val oldSetting = settings.get(feature)
		val oldValue = oldSetting.get
		if( oldValue != newValue ) {
			settings.put(feature, resource.createSetting(feature, newValue) as Setting<?>)
		}
		this	// for chaining
	}

	public val Map<String, Object> annotationSettings = newHashMap

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
			put('metaType', metaClass.name)
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
			put('@settings', new JSONObject => [
				metaClass.metaModel.allAnnotations(metaClass).forEach[ anno |
					val value = getAnnotation(anno)
					if( value != null ) {
						put(anno, value)
					}
				]
			])
		]
	}

}
