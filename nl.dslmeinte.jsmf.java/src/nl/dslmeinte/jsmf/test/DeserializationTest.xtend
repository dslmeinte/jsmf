package nl.dslmeinte.jsmf.test

import nl.dslmeinte.jsmf.meta.MetaClass
import nl.dslmeinte.jsmf.meta.MetaModel
import nl.dslmeinte.jsmf.model.MList
import nl.dslmeinte.jsmf.model.MObject
import nl.dslmeinte.jsmf.model.MResource
import org.junit.Test

import static org.junit.Assert.*

class DeserializationTest {

	extension TestDataHelper = new TestDataHelper

	@Test
	def void test1() {
		val metaModel = new MetaModel(1.testMetaModelPath.fileAsJSONArray)
		assertEquals(9, metaModel.types.size)
		val classifierMetaType = metaModel.lookupType("Classifier")
		assertTrue(classifierMetaType !== null)
		assertTrue(classifierMetaType instanceof MetaClass)

		val model = new MResource(metaModel, 1.testMigratedModelPath.fileAsJSONArray)
		val clazz = model.<MObject>lookup(3)
		val features = clazz.<MList>get("features")
		val typeRef = (features.<MObject>first).get("type")
		println(typeRef)

		model.toJSON.jsonToFile(1.testSerializedModelPath)
	}

}
