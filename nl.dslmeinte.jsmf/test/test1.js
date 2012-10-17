(function() {

	var metaModelJSON = [ {
		"metaMetaType" : "Datatype",
		"name" : "String"
	}, {
		"metaMetaType" : "Datatype",
		"name" : "Integer"
	}, {
		"metaMetaType" : "Datatype",
		"name" : "Boolean"
	}, {
		"metaMetaType" : "Enum",
		"name" : "FeatureKindType",
		"literals" : [ "attribute", "reference", "containment" ]
	}, {
		"metaMetaType" : "Class",
		"name" : "Classifier",
		"abstract" : true,
		"features" : [ {
			"name" : "name",
			"kind" : "attribute",
			"lowerLimit" : 1,
			"upperLimit" : 1,
			"type" : "String"
		} ]
	}, {
		"metaMetaType" : "Class",
		"name" : "Datatype",
		"superTypes" : [ "Classifier" ]
	}, {
		"metaMetaType" : "Class",
		"name" : "Enum",
		"superTypes" : [ "Datatype" ],
		"features" : [ {
			"name" : "literals",
			"kind" : "attribute",
			"lowerLimit" : 1,
			"upperLimit" : -1,
			"type" : "String"
		} ]
	}, {
		"metaMetaType" : "Class",
		"name" : "Class",
		"superTypes" : [ "Classifier" ],
		"features" : [ {
			"name" : "superTypes",
			"kind" : "reference",
			"upperLimit" : -1,
			"type" : "Class"
		}, {
			"name" : "features",
			"kind" : "containment",
			"upperLimit" : -1,
			"type" : "Feature"
		}, {
			"name" : "abstract",
			"kind" : "attribute",
			"upperLimit" : 1,
			"type" : "Boolean"
		} ]
	}, {
		"metaMetaType" : "Class",
		"name" : "Feature",
		"features" : [ {
			"name" : "name",
			"kind" : "attribute",
			"lowerLimit" : 1,
			"upperLimit" : 1,
			"type" : "String"
		}, {
			"name" : "kind",
			"kind" : "attribute",
			"lowerLimit" : 1,
			"upperLimit" : 1,
			"type" : "FeatureKindType"
		}, {
			"name" : "lowerLimit",
			"kind" : "attribute",
			"upperLimit" : 1,
			"type" : "Integer"
		}, {
			"name" : "upperLimit",
			"kind" : "attribute",
			"upperLimit" : 1,
			"type" : "Integer"
		}, {
			"name" : "type",
			"kind" : "reference",
			"lowerLimit" : 1,
			"upperLimit" : 1,
			"type" : "Classifier"
		} ]
	} ];

	var modelJSON = [ {
		"_class" : "Datatype",
		"name" : "String"
	}, {
		"_class" : "Class",
		"name" : "Expression",
		"abstract" : true
	}, {
		"_class" : "Class",
		"name" : "Sqrt",
		"superTypes" : [ "Expression" ],
		"features" : [ {
			"_class" : "Feature",
			"name" : "expr",
			"kind" : "containment",
			"lowerLimit" : 1,
			"upperLimit" : 1,
			"type" : "Expression"
		} ]
	}, {
		"_class" : "Class",
		"name" : "Fraction",
		"superTypes" : [ "Expression" ],
		"features" : [ {
			"_class" : "Feature",
			"name" : "expr1",
			"kind" : "containment",
			"lowerLimit" : 1,
			"upperLimit" : 1,
			"type" : "Expression"
		}, {
			"_class" : "Feature",
			"name" : "expr2",
			"kind" : "containment",
			"lowerLimit" : 1,
			"upperLimit" : 1,
			"type" : "Expression"
		} ]
	}, {
		"_class" : "Class",
		"name" : "Mult",
		"superTypes" : [ "Expression" ],
		"features" : [ {
			"_class" : "Feature",
			"name" : "expr1",
			"kind" : "containment",
			"lowerLimit" : 1,
			"upperLimit" : 1,
			"type" : "Expression"
		}, {
			"_class" : "Feature",
			"name" : "expr2",
			"kind" : "containment",
			"lowerLimit" : 1,
			"upperLimit" : 1,
			"type" : "Expression"
		} ]
	}, {
		"_class" : "Class",
		"name" : "Plus",
		"superTypes" : [ "Expression" ],
		"features" : [ {
			"_class" : "Feature",
			"name" : "expr1",
			"kind" : "containment",
			"lowerLimit" : 1,
			"upperLimit" : 1,
			"type" : "Expression"
		}, {
			"_class" : "Feature",
			"name" : "expr2",
			"kind" : "containment",
			"lowerLimit" : 1,
			"upperLimit" : 1,
			"type" : "Expression"
		} ]
	}, {
		"_class" : "Class",
		"name" : "Neg",
		"superTypes" : [ "Expression" ],
		"features" : [ {
			"_class" : "Feature",
			"name" : "expr",
			"kind" : "containment",
			"lowerLimit" : 1,
			"upperLimit" : 1,
			"type" : "Expression"
		} ]
	}, {
		"_class" : "Class",
		"name" : "Value",
		"superTypes" : [ "Expression" ],
		"features" : [ {
			"_class" : "Feature",
			"name" : "value",
			"kind" : "attribute",
			"lowerLimit" : 1,
			"upperLimit" : 1,
			"type" : "String"
		} ]
	} ];

	test("initialising Concrete meta meta model and arithmetic expressions meta model (test1.js)", function() {
			var metaModel = jsmf.meta.createMetaModelFromJSON(metaModelJSON);
			ok(metaModel, "meta meta model initialised");
			equal(jsmf.util.countProperties(metaModel.classifiers), 9, "#meta meta classes correct");
			var classifierClass = metaModel.classifiers['Classifier'];
			ok(classifierClass.features['name'], "Class 'Class' knows about its 'name' feature");
			var datatypeClass = metaModel.classifiers['Datatype'];
			ok(datatypeClass && datatypeClass.name === 'Datatype', "Class 'Datatype' loaded correctly");
			ok(datatypeClass.allFeatures()['name'], "Class 'Datatype' knows about its 'name' feature");
			var featuresFeature = metaModel.classifiers['Class'].features['features'];
			ok(featuresFeature instanceof jsmf.meta.Feature, "Feature is reified");
			var modelResource = jsmf.model.Factory.createMResource(modelJSON, metaModel);
			ok(modelResource, "meta model initialised");
			equal(modelResource.contents.size(), 8, "#meta classes correct");
		});

})();
