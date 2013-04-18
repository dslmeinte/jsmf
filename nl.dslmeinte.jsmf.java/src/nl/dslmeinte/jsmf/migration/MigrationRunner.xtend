package nl.dslmeinte.jsmf.migration

import java.io.File
import java.io.FileInputStream
import nl.dslmeinte.jsmf.meta.MetaModel
import org.apache.commons.io.FileUtils
import org.json.JSONArray
import org.json.JSONTokener

class MigrationRunner {

	def static void main(String[] args) {
		new MigrationRunner().migrate("../nl.dslmeinte.jsmf/test/json/test1/")
		new MigrationRunner().migrate("../nl.dslmeinte.jsmf/test/json/test2/")
		new MigrationRunner().migrate("../nl.dslmeinte.jsmf/test/json/test3/")
		new MigrationRunner().migrate("../nl.dslmeinte.jsmf/test/json/test4/")
	}

	def private migrate(String path) {
		val metaModel = new MetaModel((path + "metaModel.json").fileAsJSONArray)
		val migrator = new ModelFormatMigrator(metaModel, (path + "model.json").fileAsJSONArray)
		FileUtils::write(new File(path + "migratedModel.json"), migrator.migratedModel.toString(2))
		println("migrated model located in: " + path)
	}

	def private fileAsJSONArray(String path) {
		new JSONArray(new JSONTokener(new FileInputStream(new File(path))))
	}

}
