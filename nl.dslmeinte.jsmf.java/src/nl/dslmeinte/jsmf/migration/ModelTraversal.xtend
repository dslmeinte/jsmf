package nl.dslmeinte.jsmf.migration

import nl.dslmeinte.jsmf.util.LightWeightJSONUtil
import org.json.JSONArray
import org.json.JSONObject

class ModelTraversal {
	
	new((JSONObject)=>void objectFunction) {
		this.objectFunction = objectFunction
	}

	val (JSONObject)=>void objectFunction


	extension LightWeightJSONUtil = new LightWeightJSONUtil

	def void handleAndRecurse(Object it) {
//		println('''		<«^class.simpleName»>«toString»''')
		switch it {
			JSONObject: {
				objectFunction.apply(it)
				val settings = optJSONObject('settings')
				if( settings !== null ) {
//					println('''			«settings.keys.toList»''')
					settings => [
						keys.forEach[ key | get(key).handleAndRecurse ]
					]
				}
			}
			JSONArray:		forEach[handleAndRecurse]
			Iterable<?>:	forEach[handleAndRecurse]
			default:		{ /* do nothing */ }
		}
	}

}
