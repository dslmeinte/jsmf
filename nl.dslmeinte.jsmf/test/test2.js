(function test2() {

	var metaModelJSON = [
	                     {"_class": "Datatype", "name": "String"}, 
	                     {"_class": "Class", "name": "Statemachine", "features": [
                              {"_class": "Feature", "name": "name", "kind": "attribute", "lowerLimit": 1, "upperLimit": 1, "type": "String"}, 
                              {"_class": "Feature", "name": "variables", "kind": "containment", "type": "Variable"}, 
                              {"_class": "Feature", "name": "triggers", "kind": "containment", "type": "Trigger"}, 
                              {"_class": "Feature", "name": "states", "kind": "containment", "type": "State"}]}, 
                            {"_class": "Class", "name": "Variable", "features": 
                              {"_class": "Feature", "name": "name", "kind": "attribute", "lowerLimit": 1, "upperLimit": 1, "type": "String"}}, 
                            {"_class": "Class", "name": "Trigger", "features": 
                              {"_class": "Feature", "name": "name", "kind": "attribute", "lowerLimit": 1, "upperLimit": 1, "type": "String"}}, 
                            {"_class": "Class", "name": "State", "abstract": true, "features": [
                              {"_class": "Feature", "name": "name", "kind": "attribute", "lowerLimit": 1, "upperLimit": 1, "type": "String"}, 
                              {"_class": "Feature", "name": "transitions", "kind": "containment", "upperLimit": -1, "type": "Transition"}]}, 
                            {"_class": "Class", "name": "SimpleState", "superTypes": "State"}, 
                            {"_class": "Class", "name": "CompositeState", "superTypes": "State", "features": 
                              {"_class": "Feature", "name": "subStates", "kind": "containment", "upperLimit": -1, "type": "State"}}, 
                            {"_class": "Class", "name": "Transition", "features": [
                              {"_class": "Feature", "name": "targetState", "kind": "reference", "lowerLimit": 1, "upperLimit": 1, "type": "State"}, 
                              {"_class": "Feature", "name": "trigger", "kind": "reference", "upperLimit": -1, "type": "Trigger"}, 
                              {"_class": "Feature", "name": "condition", "kind": "containment", "upperLimit": 1, "type": "Expression"}]}, 
                            {"_class": "Class", "name": "Expression"}, 
                            {"_class": "Class", "name": "AndExpression", "superTypes": "Expression", "features": [
                              {"_class": "Feature", "name": "expr1", "kind": "containment", "lowerLimit": 1, "upperLimit": -1, "type": "Expression"}, 
                              {"_class": "Feature", "name": "expr2", "kind": "containment", "lowerLimit": 1, "upperLimit": -1, "type": "Expression"}]}, 
                            {"_class": "Class", "name": "OrExpression", "superTypes": "Expression", "features": [
                              {"_class": "Feature", "name": "expr1", "kind": "containment", "lowerLimit": 1, "upperLimit": -1, "type": "Expression"}, 
                              {"_class": "Feature", "name": "expr2", "kind": "containment", "lowerLimit": 1, "upperLimit": -1, "type": "Expression"}]}, 
                            {"_class": "Class", "name": "NotExpression", "superTypes": "Expression", "features": 
                              {"_class": "Feature", "name": "expr", "kind": "containment", "lowerLimit": 1, "upperLimit": -1, "type": "Expression"}}, 
                            {"_class": "Class", "name": "VarRef", "superTypes": "Expression", "features": 
                              {"_class": "Feature", "name": "variable", "kind": "reference", "lowerLimit": 1, "upperLimit": 1, "type": "Variable"}}];

	var modelJSON = [{"_class": "Statemachine", "name": "AC", "triggers": [
	                                                                       {"_class": "Trigger", "name": "OnButton"}, 
	                                                                       {"_class": "Trigger", "name": "ModeButton"}], "states": [
	                                                                       {"_class": "SimpleState", "name": "Off", "transitions": 
	                                                                         {"_class": "Transition", "targetState": "/AC/On", "trigger": "/AC/OnButton"}}, 
	                                                                       {"_class": "CompositeState", "name": "On", "subStates": [
	                                                                         {"_class": "SimpleState", "name": "Heating", "transitions": 
	                                                                           {"_class": "Transition", "targetState": "/AC/On/Cooling", "trigger": "/AC/ModeButton"}}, 
	                                                                         {"_class": "SimpleState", "name": "Cooling", "transitions": 
	                                                                           {"_class": "Transition", "targetState": "/AC/On/Heating", "trigger": "/AC/ModeButton"}}], "transitions": 
	                                                                         {"_class": "Transition", "targetState": "/AC/Off", "trigger": "/AC/OnButton"}}]}];

	test("initialising statemachine meta model and model (test2.js)", function() {
			var metaModel = jsmf.ecore.createEPackageFromConcrete(metaModelJSON);
			ok(metaModel, "meta meta model initialised");
			var model = jsmf.emf.createEResource(modelJSON, metaModel);
			ok(model, "meta model initialised");
		});

})();
