package nl.dslmeinte.jsmf.test

import java.io.File
import java.io.FileInputStream
import org.apache.commons.io.FileUtils
import org.json.JSONArray
import org.json.JSONObject
import org.json.JSONTokener
import org.json.JSONType

class TestDataHelper {

	val testJSONPath = "../nl.dslmeinte.jsmf/test/"

	def testPath(int n)					{ testJSONPath + "test" + n + "/" }
	def testMetaModelPath(int n)		{ n.testPath + "metaModel.json" }
	def testOriginalModelPath(int n)	{ n.testPath + "originalModel.json" }
	def testMigratedModelPath(int n)	{ n.testPath + "model.json" }
	def testSerializedModelPath(int n)	{ n.testPath + "serializedModel.json" }

	def fileAsJSONArray(String path) {
		new JSONArray(new JSONTokener(new FileInputStream(new File(path))))
	}

	def jsonToFile(JSONType json, String path) {
		FileUtils::write(new File(path), json.prettyPrint)
	}

	def private prettyPrint(JSONType json) {
		switch json {
			JSONObject:	json.toString(2)
			JSONArray:	json.toString(2)
		}
	}

}
