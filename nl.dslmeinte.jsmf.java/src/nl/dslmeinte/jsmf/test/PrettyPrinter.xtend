package nl.dslmeinte.jsmf.test

import org.json.JSONArray
import org.json.JSONTokener

class PrettyPrinter {

	def static void main(String[] args) {
		new PrettyPrinter().run
	}

	def private run() {
		println(new JSONArray(new JSONTokener(System::in)).toString(2))
	}

}
