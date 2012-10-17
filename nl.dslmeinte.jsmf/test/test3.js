(function() {

	var metaModelJSON = [ {
		"_class" : "Datatype",
		"name" : "String"
	}, {
		"_class" : "Class",
		"name" : "Statemachine",
		"features" : [ {
			"name" : "name",
			"kind" : "attribute",
			"lowerLimit" : 1,
			"upperLimit" : 1,
			"type" : "String"
		}, {
			"name" : "variables",
			"kind" : "containment",
			"type" : "Variable"
		}, {
			"name" : "triggers",
			"kind" : "containment",
			"type" : "Trigger"
		}, {
			"name" : "chartElements",
			"kind" : "containment",
			"type" : "ChartElement"
		} ],
		"annotations": [ "_view" ]
	}, {
		"_class" : "Class",
		"name" : "Variable",
		"features" : [ {
			"name" : "name",
			"kind" : "attribute",
			"lowerLimit" : 1,
			"upperLimit" : 1,
			"type" : "String"
		} ]
	}, {
		"_class" : "Class",
		"name" : "Trigger",
		"features" : [ {
			"name" : "name",
			"kind" : "attribute",
			"lowerLimit" : 1,
			"upperLimit" : 1,
			"type" : "String"
		} ],
		"annotations": [ "_view" ]
	}, {
		"_class" : "Class",
		"name" : "ChartElement",
		"abstract" : true,
		"annotations": [ "_view" ]
	}, {
		"_class" : "Class",
		"name" : "State",
		"abstract" : true,
		"superTypes" : [ "ChartElement" ],
		"features" : [ {
			"name" : "name",
			"kind" : "attribute",
			"lowerLimit" : 1,
			"upperLimit" : 1,
			"type" : "String"
		} ],
		"annotations": [ "_view" ]
	}, {
		"_class" : "Class",
		"name" : "SimpleState",
		"superTypes" : [ "State" ]
	}, {
		"_class" : "Class",
		"name" : "CompositeState",
		"superTypes" : [ "State" ],
		"features" : [ {
			"name" : "chartElements",
			"kind" : "containment",
			"upperLimit" : -1,
			"type" : "ChartElement"
		} ]
	}, {
		"_class" : "Class",
		"name" : "Transition",
		"superTypes" : [ "ChartElement" ],
		"features" : [ {
			"name" : "sourceState",
			"kind" : "reference",
			"lowerLimit" : 1,
			"upperLimit" : 1,
			"type" : "State"
		}, {
			"name" : "targetState",
			"kind" : "reference",
			"lowerLimit" : 1,
			"upperLimit" : 1,
			"type" : "State"
		}, {
			"name" : "triggers",
			"kind" : "reference",
			"upperLimit" : -1,
			"type" : "Trigger"
		}, {
			"name" : "condition",
			"kind" : "containment",
			"upperLimit" : 1,
			"type" : "Expression"
		} ]
	}, {
		"_class" : "Class",
		"name" : "Expression"
	}, {
		"_class" : "Class",
		"name" : "AndExpression",
		"superTypes" : [ "Expression" ],
		"features" : [ {
			"name" : "expr1",
			"kind" : "containment",
			"lowerLimit" : 1,
			"upperLimit" : -1,
			"type" : "Expression"
		}, {
			"name" : "expr2",
			"kind" : "containment",
			"lowerLimit" : 1,
			"upperLimit" : -1,
			"type" : "Expression"
		} ]
	}, {
		"_class" : "Class",
		"name" : "OrExpression",
		"superTypes" : [ "Expression" ],
		"features" : [ {
			"name" : "expr1",
			"kind" : "containment",
			"lowerLimit" : 1,
			"upperLimit" : -1,
			"type" : "Expression"
		}, {
			"name" : "expr2",
			"kind" : "containment",
			"lowerLimit" : 1,
			"upperLimit" : -1,
			"type" : "Expression"
		} ]
	}, {
		"_class" : "Class",
		"name" : "NotExpression",
		"superTypes" : [ "Expression" ],
		"features" : [ {
			"name" : "expr",
			"kind" : "containment",
			"lowerLimit" : 1,
			"upperLimit" : -1,
			"type" : "Expression"
		} ]
	}, {
		"_class" : "Class",
		"name" : "VarRef",
		"superTypes" : [ "Expression" ],
		"features" : [ {
			"name" : "variable",
			"kind" : "reference",
			"lowerLimit" : 1,
			"upperLimit" : 1,
			"type" : "Variable"
		} ]
	} ];

	var modelJSON = [ {
		"_class" : "Statemachine",
		"name" : "AC",
		"triggers" : [ {
			"_class" : "Trigger",
			"_view" : {
				"collapsed" : false
			},
			"name" : "OnButton"
		}, {
			"_class" : "Trigger",
			"_view" : {
				"collapsed" : false
			},
			"name" : "ModeButton"
		} ],
		"_view" : {
			"container-size" : {
				"chartElements" : {
					"width" : "1553px",
					"height" : "211px"
				}
			}
		},
		"chartElements" : [ {
			"_class" : "SimpleState",
			"_view" : {
				"collapsed" : false,
				"position" : {
					"left" : "15px",
					"top" : "46px"
				}
			},
			"name" : "Off"
		}, {
			"_class" : "CompositeState",
			"_view" : {
				"collapsed" : false,
				"position" : {
					"left" : "397px",
					"top" : "-30px"
				},
				"container-size" : {
					"chartElements" : {
						"width" : "596px",
						"height" : "144px"
					}
				}
			},
			"name" : "On",
			"chartElements" : [ {
				"_class" : "SimpleState",
				"_view" : {
					"collapsed" : false,
					"position" : {
						"left" : "45px",
						"top" : "54px"
					}
				},
				"name" : "Heating"
			}, {
				"_class" : "SimpleState",
				"_view" : {
					"collapsed" : false,
					"position" : {
						"left" : "442px",
						"top" : "66px"
					}
				},
				"name" : "Cooling"
			}, {
				"_class" : "Transition",
				"_view" : {
					"position" : {
						"left" : "236px",
						"top" : "4px"
					},
					"variant" : 1
				},
				"sourceState" : "/AC/On/Heating",
				"targetState" : "/AC/On/Cooling",
				"triggers" : [ "/AC/ModeButton" ]
			}, {
				"_class" : "Transition",
				"_view" : {
					"position" : {
						"left" : "235px",
						"top" : "82px"
					},
					"variant" : 2
				},
				"sourceState" : "/AC/On/Cooling",
				"targetState" : "/AC/On/Heating",
				"triggers" : [ "/AC/ModeButton" ]
			} ]
		}, {
			"_class" : "Transition",
			"_view" : {
				"position" : {
					"left" : "214px",
					"top" : "93px"
				},
				"variant" : 1
			},
			"sourceState" : "/AC/Off",
			"targetState" : "/AC/On/Heating",
			"triggers" : [ "/AC/OnButton" ]
		}, {
			"_class" : "Transition",
			"_view" : {
				"position" : {
					"left" : "212px",
					"top" : "-19px"
				},
				"variant" : 2
			},
			"sourceState" : "/AC/On",
			"targetState" : "/AC/Off",
			"triggers" : [ "/AC/OnButton" ]
		} ]
	} ];

	test("initialising statemachine meta model and example model (test3.js) - with view info", function() {
			var metaModel = jsmf.meta.createMetaModelFromJSON(metaModelJSON);
			ok(metaModel, "statemachine meta model initialised");
			var modelResource = jsmf.model.Factory.createMResource(modelJSON, metaModel);
			ok(modelResource, "example model initialised");
		});

})();
