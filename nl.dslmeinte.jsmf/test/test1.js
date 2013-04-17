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
			"required" : true,
			"manyValued" : false,
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
			"required" : true,
			"manyValued" : false,
			"type" : "String"
		} ]
	}, {
		"metaMetaType" : "Class",
		"name" : "Class",
		"superTypes" : [ "Classifier" ],
		"features" : [ {
			"name" : "superTypes",
			"kind" : "reference",
			"manyValued" : true,
			"type" : "Class"
		}, {
			"name" : "features",
			"kind" : "containment",
			"manyValued" : true,
			"type" : "Feature"
		}, {
			"name" : "abstract",
			"kind" : "attribute",
			"manyValued" : false,
			"type" : "Boolean"
		} ]
	}, {
		"metaMetaType" : "Class",
		"name" : "Feature",
		"features" : [ {
			"name" : "name",
			"kind" : "attribute",
			"required" : true,
			"manyValued" : false,
			"type" : "String"
		}, {
			"name" : "kind",
			"kind" : "attribute",
			"required" : true,
			"manyValued" : false,
			"type" : "FeatureKindType"
		}, {
			"name" : "lowerLimit",
			"kind" : "attribute",
			"manyValued" : false,
			"type" : "Integer"
		}, {
			"name" : "upperLimit",
			"kind" : "attribute",
			"manyValued" : false,
			"type" : "Integer"
		}, {
			"name" : "type",
			"kind" : "reference",
			"required" : true,
			"manyValued" : false,
			"type" : "Classifier"
		} ]
	} ];

	var modelJSON = [ {
		"metaType" : "Datatype",
		"settings" : {
			"name" : "String"
		}
	}, {
		"metaType" : "Class",
		"settings" : {
			"name" : "Expression",
			"abstract" : true
		}
	}, {
		"metaType" : "Class",
		"settings" : {
			"name" : "Sqrt",
			"superTypes" : [ { hint: "Expression" } ],
			"features" : [ {
				"metaType" : "Feature",
				"settings" : {
					"name" : "expr",
					"kind" : "containment",
					"lowerLimit" : 1,
					"upperLimit" : 1,
					"type" : { hint: "Expression" }
				}
			} ]
		}
	}, {
		"metaType" : "Class",
		"settings" : {
			"name" : "Fraction",
			"superTypes" : [ { hint: "Expression" } ],
			"features" : [ {
				"metaType" : "Feature",
				"settings" : {
					"name" : "expr1",
					"kind" : "containment",
					"lowerLimit" : 1,
					"upperLimit" : 1,
					"type" : { hint: "Expression" }
				}
			}, {
				"metaType" : "Feature",
				"settings" : {
					"name" : "expr2",
					"kind" : "containment",
					"lowerLimit" : 1,
					"upperLimit" : 1,
					"type" : { hint: "Expression" }
				}
			} ]
		}
	}, {
		"metaType" : "Class",
		"settings" : {
			"name" : "Mult",
			"superTypes" : [ { hint: "Expression" } ],
			"features" : [ {
				"metaType" : "Feature",
				"settings" : {
					"name" : "expr1",
					"kind" : "containment",
					"lowerLimit" : 1,
					"upperLimit" : 1,
					"type" : { hint: "Expression" }
				}
			}, {
				"metaType" : "Feature",
				"settings" : {
					"name" : "expr2",
					"kind" : "containment",
					"lowerLimit" : 1,
					"upperLimit" : 1,
					"type" : { hint: "Expression" }
				}
			} ]
		}
	}, {
		"metaType" : "Class",
		"settings" : {
			"name" : "Plus",
			"superTypes" : [ { hint: "Expression" } ],
			"features" : [ {
				"metaType" : "Feature",
				"settings" : {
					"name" : "expr1",
					"kind" : "containment",
					"lowerLimit" : 1,
					"upperLimit" : 1,
					"type" : { hint: "Expression" }
				}
			}, {
				"metaType" : "Feature",
				"settings" : {
					"name" : "expr2",
					"kind" : "containment",
					"lowerLimit" : 1,
					"upperLimit" : 1,
					"type" : { hint: "Expression" }
				}
			} ]
		}
	}, {
		"metaType" : "Class",
		"settings" : {
			"name" : "Neg",
			"superTypes" : [ { hint: "Expression" } ],
			"features" : [ {
				"metaType" : "Feature",
				"settings" : {
					"name" : "expr",
					"kind" : "containment",
					"lowerLimit" : 1,
					"upperLimit" : 1,
					"type" : { hint: "Expression" }
				}
			} ]
		}
	}, {
		"metaType" : "Class",
		"settings" : {
			"name" : "Value",
			"superTypes" : [ { hint: "Expression" } ],
			"features" : [ {
				"metaType" : "Feature",
				"settings" : {
					"name" : "value",
					"kind" : "attribute",
					"lowerLimit" : 1,
					"upperLimit" : 1,
					"type" : { hint: "String" }
				}
			} ]
		}
	} ];

	test("initialising Concrete meta meta model and arithmetic expressions meta model (test1.js)", function() {
			var metaModel = jsmf.meta.createMetaModelFromJSON(metaModelJSON);
			ok(metaModel, "meta meta model initialised");
			equal(jsmf.util.testing.countProperties(metaModel.classifiers), 9, "#meta meta classes correct");
			var classifierClass = metaModel.classifiers['Classifier'];
			ok(classifierClass.features['name'], "Class 'Class' knows about its 'name' feature");
			var datatypeClass = metaModel.classifiers['Datatype'];
			ok(datatypeClass && datatypeClass.name === 'Datatype', "Class 'Datatype' loaded correctly");
			ok(datatypeClass.allFeatures()['name'], "Class 'Datatype' knows about its 'name' feature");
			var featuresFeature = metaModel.classifiers['Class'].features['features'];
			ok(featuresFeature instanceof jsmf.meta.Feature, "Feature is reified");
			var modelResource = jsmf.model.Factory.createMResource(modelJSON, metaModel, defaultValidationCallback);
			ok(modelResource, "meta model initialised");
			equal(modelResource.contents.size(), 8, "#meta classes correct");
		});

})();
