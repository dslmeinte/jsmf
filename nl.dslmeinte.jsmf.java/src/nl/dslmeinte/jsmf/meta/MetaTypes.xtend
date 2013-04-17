package nl.dslmeinte.jsmf.meta

import java.util.List

class MetaType {

	public String name

}

class MetaDatatype extends MetaType {}

class MetaClass extends MetaType {

	private boolean abstract_
	def isAbstract()				{ abstract_ }
	def setAbstract(boolean value)	{ abstract_ = value}

	public List<String> superTypeNames

	public List<MetaFeature> features

}

class MetaEnum extends MetaType {

	public List<String> literals

}


class MetaFeature {

	public String name

	public FeatureKind kind

	public boolean required

	public boolean manyValued

	public String typeName

}

