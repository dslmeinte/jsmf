package nl.dslmeinte.jsmf.util

import java.util.List
import org.json.JSONArray
import org.json.JSONObject

class LightWeightJSONUtil {

	def <U, V> map(JSONArray it, (U)=>V function) {
		val result = <V>newArrayList

		for( i : 0..(length-1) ) {
			result.add(function.apply(get(i) as U))
		}

		result as List<V>
	}

	def transform(JSONObject it, (Object)=>Object function) {
		val result = new JSONObject

		keys.forEach[ key |
			result.put(key, function.apply(get(key)))
		]

		return result
	}

	def transform(JSONObject it, (String, Object)=>Object function) {
		val result = new JSONObject

		keys.forEach[ key |
			result.put(key, function.apply(key, get(key)))
		]

		return result
	}

}
