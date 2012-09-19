(function() {

	var metaModelJSON = [ {
		"_class" : "Datatype",
		"name" : "String"
	}, {
		"_class" : "Class",
		"name" : "Expression",
		"abstract" : true
	}, {
		"_class" : "Class",
		"name" : "Sqrt",
		"superTypes" : "Expression",
		"features" : {
			"_class" : "Feature",
			"name" : "expr",
			"kind" : "containment",
			"lowerLimit" : 1,
			"upperLimit" : 1,
			"type" : "Expression"
		}
	}, {
		"_class" : "Class",
		"name" : "Fraction",
		"superTypes" : "Expression",
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
		"superTypes" : "Expression",
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
		"superTypes" : "Expression",
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
		"superTypes" : "Expression",
		"features" : {
			"_class" : "Feature",
			"name" : "expr",
			"kind" : "containment",
			"lowerLimit" : 1,
			"upperLimit" : 1,
			"type" : "Expression"
		}
	}, {
		"_class" : "Class",
		"name" : "Value",
		"superTypes" : "Expression",
		"features" : {
			"_class" : "Feature",
			"name" : "value",
			"kind" : "attribute",
			"lowerLimit" : 1,
			"upperLimit" : 1,
			"type" : "String"
		}
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
			var metaModel = jsmf.ecore.createEPackageFromConcrete(metaModelJSON);
			ok(metaModel, "arithmetic expressions meta model initialised");
			var modelResource = jsmf.emf.createEResource(modelJSON, metaModel);
			ok(modelResource, "example model initialised");
		});

})();
