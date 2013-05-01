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

	def <U> void forEach(JSONArray it, (U)=>void function) {
		for( i : 0..(length-1) ) {
			function.apply(get(i) as U)
		}
	}

	def <U, V> void forEach(JSONObject it, (String, U)=>V function) {
		keys.forEach[ key | function.apply(key, get(key) as U) ]
	}

	def transform(JSONObject it, (String, Object)=>Object function) {
		val result = new JSONObject

		keys.forEach[ key |
			result.put(key, function.apply(key, get(key)))
		]

		return result
	}

}
