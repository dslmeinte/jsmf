package nl.dslmeinte.jsmf.migration

import java.io.File
import java.io.FileInputStream
import nl.dslmeinte.jsmf.meta.MetaModel
import org.apache.commons.io.FileUtils
import org.json.JSONArray
import org.json.JSONTokener

class MigrationRunner {

	def static void main(String[] args) {
		new MigrationRunner().run
	}

	def run() {
		(1..4).forEach[migrateTest]
	}

	val testJSONPath = "../nl.dslmeinte.jsmf/test/json/"

	def private testPath(int n)					{ testJSONPath + "test" + n + "/" }
	def private testMetaModelPath(int n)		{ n.testPath + "metaModel.json" }
	def private testModelPath(int n)			{ n.testPath + "model.json" }
	def private testMigratedModelPath(int n)	{ n.testPath + "migratedModel.json" }

	def private migrateTest(int n) {
		migrate(n.testMetaModelPath, n.testModelPath, n.testMigratedModelPath)
	}

	def private migrate(String metaModelFile, String modelFile, String migratedModelFile) {
		val metaModel = new MetaModel(metaModelFile.fileAsJSONArray)
		val migrator = new ModelFormatMigrator(metaModel, modelFile.fileAsJSONArray)
		FileUtils::write(new File(migratedModelFile), migrator.migratedModel.toString(2))
		println("migrated model in file: " + modelFile)
	}

	def private fileAsJSONArray(String path) {
		new JSONArray(new JSONTokener(new FileInputStream(new File(path))))
	}

}
