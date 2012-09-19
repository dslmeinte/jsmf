(function() {

	var metaModelJSON = [ {
		"_class" : "Datatype",
		"name" : "String"
	}, {
		"_class" : "Class",
		"name" : "Statemachine",
		"features" : [ {
			"_class" : "Feature",
			"name" : "name",
			"kind" : "attribute",
			"lowerLimit" : 1,
			"upperLimit" : 1,
			"type" : "String"
		}, {
			"_class" : "Feature",
			"name" : "variables",
			"kind" : "containment",
			"type" : "Variable"
		}, {
			"_class" : "Feature",
			"name" : "triggers",
			"kind" : "containment",
			"type" : "Trigger"
		}, {
			"_class" : "Feature",
			"name" : "states",
			"kind" : "containment",
			"type" : "State"
		} ]
	}, {
		"_class" : "Class",
		"name" : "Variable",
		"features" : {
			"_class" : "Feature",
			"name" : "name",
			"kind" : "attribute",
			"lowerLimit" : 1,
			"upperLimit" : 1,
			"type" : "String"
		}
	}, {
		"_class" : "Class",
		"name" : "Trigger",
		"features" : {
			"_class" : "Feature",
			"name" : "name",
			"kind" : "attribute",
			"lowerLimit" : 1,
			"upperLimit" : 1,
			"type" : "String"
		}
	}, {
		"_class" : "Class",
		"name" : "State",
		"abstract" : true,
		"features" : [ {
			"_class" : "Feature",
			"name" : "name",
			"kind" : "attribute",
			"lowerLimit" : 1,
			"upperLimit" : 1,
			"type" : "String"
		}, {
			"_class" : "Feature",
			"name" : "transitions",
			"kind" : "containment",
			"upperLimit" : -1,
			"type" : "Transition"
		} ]
	}, {
		"_class" : "Class",
		"name" : "SimpleState",
		"superTypes" : "State"
	}, {
		"_class" : "Class",
		"name" : "CompositeState",
		"superTypes" : "State",
		"features" : {
			"_class" : "Feature",
			"name" : "subStates",
			"kind" : "containment",
			"upperLimit" : -1,
			"type" : "State"
		}
	}, {
		"_class" : "Class",
		"name" : "Transition",
		"features" : [ {
			"_class" : "Feature",
			"name" : "targetState",
			"kind" : "reference",
			"lowerLimit" : 1,
			"upperLimit" : 1,
			"type" : "State"
		}, {
			"_class" : "Feature",
			"name" : "trigger",
			"kind" : "reference",
			"upperLimit" : -1,
			"type" : "Trigger"
		}, {
			"_class" : "Feature",
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
		"superTypes" : "Expression",
		"features" : [ {
			"_class" : "Feature",
			"name" : "expr1",
			"kind" : "containment",
			"lowerLimit" : 1,
			"upperLimit" : -1,
			"type" : "Expression"
		}, {
			"_class" : "Feature",
			"name" : "expr2",
			"kind" : "containment",
			"lowerLimit" : 1,
			"upperLimit" : -1,
			"type" : "Expression"
		} ]
	}, {
		"_class" : "Class",
		"name" : "OrExpression",
		"superTypes" : "Expression",
		"features" : [ {
			"_class" : "Feature",
			"name" : "expr1",
			"kind" : "containment",
			"lowerLimit" : 1,
			"upperLimit" : -1,
			"type" : "Expression"
		}, {
			"_class" : "Feature",
			"name" : "expr2",
			"kind" : "containment",
			"lowerLimit" : 1,
			"upperLimit" : -1,
			"type" : "Expression"
		} ]
	}, {
		"_class" : "Class",
		"name" : "NotExpression",
		"superTypes" : "Expression",
		"features" : {
			"_class" : "Feature",
			"name" : "expr",
			"kind" : "containment",
			"lowerLimit" : 1,
			"upperLimit" : -1,
			"type" : "Expression"
		}
	}, {
		"_class" : "Class",
		"name" : "VarRef",
		"superTypes" : "Expression",
		"features" : {
			"_class" : "Feature",
			"name" : "variable",
			"kind" : "reference",
			"lowerLimit" : 1,
			"upperLimit" : 1,
			"type" : "Variable"
		}
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
			"transitions" : {
				"_class" : "Transition",
				"targetState" : "/AC.states/On",
				"trigger" : "/AC.triggers/OnButton"
			}
		}, {
			"_class" : "CompositeState",
			"name" : "On",
			"subStates" : [ {
				"_class" : "SimpleState",
				"name" : "Heating",
				"transitions" : {
					"_class" : "Transition",
					"targetState" : "/AC.states/On.subStates/Cooling",
					"trigger" : "/AC.triggers/ModeButton"
				}
			}, {
				"_class" : "SimpleState",
				"name" : "Cooling",
				"transitions" : {
					"_class" : "Transition",
					"targetState" : "/AC.states/On.subStates/Heating",
					"trigger" : "/AC.triggers/ModeButton"
				}
			} ],
			"transitions" : {
				"_class" : "Transition",
				"targetState" : "/AC.states/Off",
				"trigger" : "/AC.triggers/OnButton"
			}
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
				"trigger" : [ "/AC.triggers/OnButton" ]
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
					"trigger" : [ "/AC.triggers/ModeButton" ]
				} ]
			}, {
				"_class" : "SimpleState",
				"name" : "Cooling",
				"transitions" : [ {
					"_class" : "Transition",
					"targetState" : "/AC.states/On.subStates/Heating",
					"trigger" : [ "/AC.triggers/ModeButton" ]
				} ]
			} ],
			"transitions" : [ {
				"_class" : "Transition",
				"targetState" : "/AC.states/Off",
				"trigger" : [ "/AC.triggers/OnButton" ]
			} ]
		} ]
	} ];

	test("initialising statemachine meta model and example model (test2.js)", function() {
			var metaModel = jsmf.meta.createMetaModelFromConcrete(metaModelJSON);
			ok(metaModel, "statemachine meta model initialised");
			var modelResource = jsmf.model.createResource(modelJSON, metaModel);
			ok(modelResource, "example model initialised");
			var statemachine = modelResource.contents[0];
			ok(statemachine.resource === modelResource, "backlink to eResource correct");
			var states = statemachine.get("states");
			var offState = states[0];
			var onState = states[1];
			var referencedState = offState.get("transitions")[0].get("targetState");
			ok( referencedState === onState, "reference to On state resolved correctly");
			var json = modelResource.toJSON();
			deepEqual(json, modelJSONWithoutShortcuts, "serialized model equals sanitized original JSON");
		});

})();
