package nl.dslmeinte.jsmf.migration

import java.io.File
import nl.dslmeinte.jsmf.meta.MetaModel
import nl.dslmeinte.jsmf.test.TestDataHelper
import org.apache.commons.io.FileUtils

class MigrationRunner {

	def static void main(String[] args) {
		new MigrationRunner().run
	}

	def run() {
		(1..4).forEach[migrateTest]
	}

	extension TestDataHelper = new TestDataHelper

	def private migrateTest(int n) {
		migrate(n.testMetaModelPath, n.testOriginalModelPath, n.testMigratedModelPath)
	}

	def private migrate(String metaModelFile, String modelFile, String migratedModelFile) {
		val metaModel = new MetaModel(metaModelFile.fileAsJSONArray)
		val migrator = new ModelFormatMigrator(metaModel, modelFile.fileAsJSONArray)
		FileUtils::write(new File(migratedModelFile), migrator.migratedModel.toString(2))
		println("migrated model in file: " + modelFile)
		println
	}

}
