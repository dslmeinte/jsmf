package nl.dslmeinte.jsmf.migration

import java.io.File
import java.io.FileInputStream
import nl.dslmeinte.jsmf.meta.MetaModel
import org.json.JSONArray
import org.json.JSONTokener

class MigrationRunner {

	def static void main(String[] args) {
		new MigrationRunner().run("../nl.dslmeinte.jsmf/test/json/test2/")
	}

	def private run(String path) {
		val metaModel = new MetaModel((path + "metaModel.json").fileAsJSONArray)
		val migrator = new ModelFormatMigrator(metaModel, (path + "model.json").fileAsJSONArray)
		println( migrator.migratedModel.toString(2) )
	}

	def private fileAsJSONArray(String path) {
		new JSONArray(new JSONTokener(new FileInputStream(new File(path))))
	}

}
