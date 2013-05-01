package nl.dslmeinte.jsmf.meta

import java.util.List

class MetaType extends Named {}

class MetaDatatype extends MetaType {}

class MetaClass extends MetaType {

	public val MetaModel metaModel

	new(MetaModel metaModel) {
		this.metaModel = metaModel
	}


	boolean abstract_ = false
	def isAbstract()				{ abstract_ }
	def setAbstract(boolean value)	{ abstract_ = value}

	public List<String> superTypeNames

	public List<Feature> features

	public List<String> annotationNames

}

class MetaEnum extends MetaType {

	public List<String> literals

}


class Feature extends Named {

	public FeatureKind kind

	public boolean required

	public boolean manyValued

	public String typeName

	public List<String> annotationNames

}


abstract class Named {

	public String name

}

