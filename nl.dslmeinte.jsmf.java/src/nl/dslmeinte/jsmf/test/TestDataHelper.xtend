package nl.dslmeinte.jsmf.test

import java.io.File
import java.io.FileInputStream
import org.json.JSONArray
import org.json.JSONTokener

class TestDataHelper {

	val testJSONPath = "../nl.dslmeinte.jsmf/test/"

	def testPath(int n)					{ testJSONPath + "test" + n + "/" }
	def testMetaModelPath(int n)		{ n.testPath + "metaModel.json" }
	def testOriginalModelPath(int n)	{ n.testPath + "originalModel.json" }
	def testMigratedModelPath(int n)	{ n.testPath + "model.json" }

	def fileAsJSONArray(String path) {
		new JSONArray(new JSONTokener(new FileInputStream(new File(path))))
	}

}