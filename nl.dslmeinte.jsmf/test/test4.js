(function() {

	var metaModelJSON = [ {
		"metaMetaType" : "Datatype",
		"name" : "String"
	}, {
		"metaMetaType" : "Class",
		"name" : "Expression",
		"abstract" : true
	}, {
		"metaMetaType" : "Class",
		"name" : "Sqrt",
		"superTypes" : [ "Expression" ],
		"features" : [ {
			"name" : "expr",
			"kind" : "containment",
			"lowerLimit" : 1,
			"upperLimit" : 1,
			"type" : "Expression"
		} ]
	}, {
		"metaMetaType" : "Class",
		"name" : "Fraction",
		"superTypes" : [ "Expression" ],
		"features" : [ {
			"name" : "expr1",
			"kind" : "containment",
			"lowerLimit" : 1,
			"upperLimit" : 1,
			"type" : "Expression"
		}, {
			"name" : "expr2",
			"kind" : "containment",
			"lowerLimit" : 1,
			"upperLimit" : 1,
			"type" : "Expression"
		} ]
	}, {
		"metaMetaType" : "Class",
		"name" : "Mult",
		"superTypes" : [ "Expression" ],
		"features" : [ {
			"name" : "expr1",
			"kind" : "containment",
			"lowerLimit" : 1,
			"upperLimit" : 1,
			"type" : "Expression"
		}, {
			"name" : "expr2",
			"kind" : "containment",
			"lowerLimit" : 1,
			"upperLimit" : 1,
			"type" : "Expression"
		} ]
	}, {
		"metaMetaType" : "Class",
		"name" : "Plus",
		"superTypes" : [ "Expression" ],
		"features" : [ {
			"name" : "expr1",
			"kind" : "containment",
			"lowerLimit" : 1,
			"upperLimit" : 1,
			"type" : "Expression"
		}, {
			"name" : "expr2",
			"kind" : "containment",
			"lowerLimit" : 1,
			"upperLimit" : 1,
			"type" : "Expression"
		} ]
	}, {
		"metaMetaType" : "Class",
		"name" : "Neg",
		"superTypes" : [ "Expression" ],
		"features" : [ {
			"name" : "expr",
			"kind" : "containment",
			"lowerLimit" : 1,
			"upperLimit" : 1,
			"type" : "Expression"
		} ]
	}, {
		"metaMetaType" : "Class",
		"name" : "Value",
		"superTypes" : [ "Expression" ],
		"features" : [ {
			"name" : "value",
			"kind" : "attribute",
			"lowerLimit" : 1,
			"upperLimit" : 1,
			"type" : "String"
		} ]
	} ];

	var modelJSON = [ {
		"_class" : "Sqrt",
		"expr" : {
			"_class" : "Fraction",
			"expr1" : {
				"_class" : "Mult",
				"expr1" : {
					"_class" : "Value",
					"value" : "33"
				},
				"expr2" : {
					"_class" : "Sqrt",
					"expr" : {
						"_class" : "Fraction",
						"expr1" : {
							"_class" : "Value",
							"value" : "5"
						},
						"expr2" : {
							"_class" : "Plus",
							"expr1" : {
								"_class" : "Value",
								"value" : "100"
							},
							"expr2" : {
								"_class" : "Value",
								"value" : "7"
							}
						}
					}
				}
			},
			"expr2" : {
				"_class" : "Value",
				"value" : "6"
			}
		}
	} ];

	test("initialising arithmetic expressions meta model and example model (test4.js)", function() {
			var metaModel = jsmf.meta.createMetaModelFromJSON(metaModelJSON);
			ok(metaModel, "arithmetic expressions meta model initialised");
			var modelResource = jsmf.model.Factory.createMResource(modelJSON, metaModel);
			ok(modelResource, "example model initialised");
		});

})();
