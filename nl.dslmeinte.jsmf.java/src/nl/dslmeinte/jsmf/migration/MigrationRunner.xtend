package nl.dslmeinte.jsmf.migration

import java.io.File
import java.io.FileInputStream
import nl.dslmeinte.jsmf.meta.MetaModel

class MigrationRunner {

	def static void main(String[] args) {
		new MigrationRunner().run
	}

	def private run() {
		val inputStream = new FileInputStream(new File("../nl.dslmeinte.jsmf/test/json/test1/metaModel.json"))
		val metaModel = new MetaModel(inputStream)
		println( metaModel.types.map[^class.simpleName.substring("Meta".length) + ": " + name] )
	}

}
