(function() {

	var metaModelJSON = [ {
		"metaMetaType" : "Datatype",
		"name" : "String"
	}, {
		"metaMetaType" : "Class",
		"name" : "Statemachine",
		"features" : [ {
			"name" : "name",
			"kind" : "attribute",
			"required" : true,
			"manyValued" : false,
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
			"name" : "states",
			"kind" : "containment",
			"type" : "State"
		} ]
	}, {
		"metaMetaType" : "Class",
		"name" : "Variable",
		"features" : [ {
			"name" : "name",
			"kind" : "attribute",
			"required" : true,
			"manyValued" : false,
			"type" : "String"
		} ]
	}, {
		"metaMetaType" : "Class",
		"name" : "Trigger",
		"features" : [ {
			"name" : "name",
			"kind" : "attribute",
			"required" : true,
			"manyValued" : false,
			"type" : "String"
		} ]
	}, {
		"metaMetaType" : "Class",
		"name" : "State",
		"abstract" : true,
		"features" : [ {
			"name" : "name",
			"kind" : "attribute",
			"required" : true,
			"manyValued" : false,
			"type" : "String"
		}, {
			"name" : "transitions",
			"kind" : "containment",
			"manyValued" : true,
			"type" : "Transition"
		} ]
	}, {
		"metaMetaType" : "Class",
		"name" : "SimpleState",
		"superTypes" : [ "State" ]
	}, {
		"metaMetaType" : "Class",
		"name" : "CompositeState",
		"superTypes" : [ "State" ],
		"features" : [ {
			"name" : "subStates",
			"kind" : "containment",
			"manyValued" : true,
			"type" : "State"
		} ]
	}, {
		"metaMetaType" : "Class",
		"name" : "Transition",
		"features" : [ {
			"name" : "targetState",
			"kind" : "reference",
			"required" : true,
			"manyValued" : false,
			"type" : "State"
		}, {
			"name" : "triggers",
			"kind" : "reference",
			"manyValued" : true,
			"type" : "Trigger"
		}, {
			"name" : "condition",
			"kind" : "containment",
			"manyValued" : false,
			"type" : "Expression"
		} ]
	}, {
		"metaMetaType" : "Class",
		"name" : "Expression"
	}, {
		"metaMetaType" : "Class",
		"name" : "AndExpression",
		"superTypes" : [ "Expression" ],
		"features" : [ {
			"name" : "expr1",
			"kind" : "containment",
			"required" : true,
			"manyValued" : true,
			"type" : "Expression"
		}, {
			"name" : "expr2",
			"kind" : "containment",
			"required" : true,
			"manyValued" : true,
			"type" : "Expression"
		} ]
	}, {
		"metaMetaType" : "Class",
		"name" : "OrExpression",
		"superTypes" : [ "Expression" ],
		"features" : [ {
			"name" : "expr1",
			"kind" : "containment",
			"required" : true,
			"manyValued" : true,
			"type" : "Expression"
		}, {
			"name" : "expr2",
			"kind" : "containment",
			"required" : true,
			"manyValued" : true,
			"type" : "Expression"
		} ]
	}, {
		"metaMetaType" : "Class",
		"name" : "NotExpression",
		"superTypes" : [ "Expression" ],
		"features" : [ {
			"name" : "expr",
			"kind" : "containment",
			"required" : true,
			"manyValued" : true,
			"type" : "Expression"
		} ]
	}, {
		"metaMetaType" : "Class",
		"name" : "VarRef",
		"superTypes" : [ "Expression" ],
		"features" : [ {
			"name" : "variable",
			"kind" : "reference",
			"required" : true,
			"manyValued" : false,
			"type" : "Variable"
		} ]
	} ];

	var modelJSON = [ {
		"_class" : "Statemachine",
		"name" : "AC",
		"triggers" : [ {
			"_class" : "Trigger",
			"name" : "OnButton"
		}, {
			"_class" : "Trigger",
			"name" : "ModeButton"
		} ],
		"states" : [ {
			"_class" : "SimpleState",
			"name" : "Off",
			"transitions" : [ {
				"_class" : "Transition",
				"targetState" : "/AC.states/On",
				"triggers" : [ "/AC.triggers/OnButton" ]
			} ]
		}, {
			"_class" : "CompositeState",
			"name" : "On",
			"subStates" : [ {
				"_class" : "SimpleState",
				"name" : "Heating",
				"transitions" : [ {
					"_class" : "Transition",
					"targetState" : "/AC.states/On.subStates/Cooling",
					"triggers" : [ "/AC.triggers/ModeButton" ]
				} ]
			}, {
				"_class" : "SimpleState",
				"name" : "Cooling",
				"transitions" : [ {
					"_class" : "Transition",
					"targetState" : "/AC.states/On.subStates/Heating",
					"triggers" : [ "/AC.triggers/ModeButton" ]
				} ]
			} ],
			"transitions" : [ {
				"_class" : "Transition",
				"targetState" : "/AC.states/Off",
				"triggers" : [ "/AC.triggers/OnButton" ]
			} ]
		} ]
	} ];

	var modelJSONWithoutShortcuts = [ {
		"_class" : "Statemachine",
		"name" : "AC",
		"triggers" : [ {
			"_class" : "Trigger",
			"name" : "OnButton"
		}, {
			"_class" : "Trigger",
			"name" : "ModeButton"
		} ],
		"states" : [ {
			"_class" : "SimpleState",
			"name" : "Off",
			"transitions" : [ {
				"_class" : "Transition",
				"targetState" : "/AC.states/On",
				"triggers" : [ "/AC.triggers/OnButton" ]
			} ]
		}, {
			"_class" : "CompositeState",
			"name" : "On",
			"subStates" : [ {
				"_class" : "SimpleState",
				"name" : "Heating",
				"transitions" : [ {
					"_class" : "Transition",
					"targetState" : "/AC.states/On.subStates/Cooling",
					"triggers" : [ "/AC.triggers/ModeButton" ]
				} ]
			}, {
				"_class" : "SimpleState",
				"name" : "Cooling",
				"transitions" : [ {
					"_class" : "Transition",
					"targetState" : "/AC.states/On.subStates/Heating",
					"triggers" : [ "/AC.triggers/ModeButton" ]
				} ]
			} ],
			"transitions" : [ {
				"_class" : "Transition",
				"targetState" : "/AC.states/Off",
				"triggers" : [ "/AC.triggers/OnButton" ]
			} ]
		} ]
	} ];

	test("initialising statemachine meta model and example model (test2.js)", function() {
			var metaModel = jsmf.meta.createMetaModelFromJSON(metaModelJSON);
			ok(metaModel, "statemachine meta model initialised");
			var modelResource = jsmf.model.Factory.createMResource(modelJSON, metaModel);
			ok(modelResource, "example model initialised");
			var statemachine = modelResource.contents.at(0);
			var states = statemachine.get("states");
			var offState = states.at(0);
			var onState = states.at(1);
			var transition0 = offState.get("transitions").at(0);
			var referencedState = transition0.get("targetState");
			ok( referencedState === onState, "reference to On state resolved correctly");
			var json = modelResource.toJSON();
			deepEqual(json, modelJSONWithoutShortcuts, "serialized model equals sanitized original JSON");
		});

})();
