(function test1() {

	var metaModelJSON = [
		  {"_class": "Datatype", "name": "String"},
		  {"_class": "Datatype", "name": "Integer"},
		  {"_class": "Datatype", "name": "Boolean"},
		  {"_class": "Enum", "name": "FeatureKindType", "literals": ["attribute", "reference", "containment"]},
		  {"_class": "Class", "name": "Classifier", "abstract": true, "features": {"_class": "Feature", "name": "name", "kind": "attribute", "lowerLimit": 1, "upperLimit": 1, "type": "String"}},
		  {"_class": "Class", "name": "Datatype", "superTypes": "Classifier"},
		  {"_class": "Class", "name": "Enum", "superTypes": "Datatype", "features": {"_class": "Feature", "name": "literals", "kind": "attribute", "lowerLimit": 1, "upperLimit": -1, "type": "String"}},
		  {"_class": "Class", "name": "Class", "superTypes": "Classifier", "features": [
		    {"_class": "Feature", "name": "superTypes", "kind": "reference", "upperLimit": -1, "type": "Class"},
		    {"_class": "Feature", "name": "features", "kind": "containment", "upperLimit": -1, "type": "Feature"},
		    {"_class": "Feature", "name": "abstract", "kind": "attribute", "upperLimit": 1, "type": "Boolean"}
		  ]},
		  {"_class": "Class", "name": "Feature", "features": [
		    {"_class": "Feature", "name": "name", "kind": "attribute", "lowerLimit": 1, "upperLimit": 1, "type": "String"},
		    {"_class": "Feature", "name": "kind", "kind": "attribute", "lowerLimit": 1, "upperLimit": 1, "type": "FeatureKindType"},
		    {"_class": "Feature", "name": "lowerLimit", "kind": "attribute", "upperLimit": 1, "type": "Integer"},
		    {"_class": "Feature", "name": "upperLimit", "kind": "attribute", "upperLimit": 1, "type": "Integer"},
		    {"_class": "Feature", "name": "type", "kind": "reference", "lowerLimit": 1, "upperLimit": 1, "type": "Classifier"}
		  ]}
		];

	var modelJSON = [{"_class": "Datatype", "name": "String"}, 
	                 {"_class": "Class", "name": "Expression", "abstract": true}, 
	                 {"_class": "Class", "name": "Sqrt", "superTypes": "Expression", "features": 
	                   {"_class": "Feature", "name": "expr", "kind": "containment", "lowerLimit": 1, "upperLimit": 1, "type": "Expression"}}, 
	                 {"_class": "Class", "name": "Fraction", "superTypes": "Expression", "features": [
	                   {"_class": "Feature", "name": "expr1", "kind": "containment", "lowerLimit": 1, "upperLimit": 1, "type": "Expression"}, 
	                   {"_class": "Feature", "name": "expr2", "kind": "containment", "lowerLimit": 1, "upperLimit": 1, "type": "Expression"}]}, 
	                 {"_class": "Class", "name": "Mult", "superTypes": "Expression", "features": [
	                   {"_class": "Feature", "name": "expr1", "kind": "containment", "lowerLimit": 1, "upperLimit": 1, "type": "Expression"}, 
	                   {"_class": "Feature", "name": "expr2", "kind": "containment", "lowerLimit": 1, "upperLimit": 1, "type": "Expression"}]}, 
	                 {"_class": "Class", "name": "Plus", "superTypes": "Expression", "features": [
	                   {"_class": "Feature", "name": "expr1", "kind": "containment", "lowerLimit": 1, "upperLimit": 1, "type": "Expression"}, 
	                   {"_class": "Feature", "name": "expr2", "kind": "containment", "lowerLimit": 1, "upperLimit": 1, "type": "Expression"}]}, 
	                 {"_class": "Class", "name": "Neg", "superTypes": "Expression", "features": 
	                   {"_class": "Feature", "name": "expr", "kind": "containment", "lowerLimit": 1, "upperLimit": 1, "type": "Expression"}}, 
	                 {"_class": "Class", "name": "Value", "superTypes": "Expression", "features": 
	                   {"_class": "Feature", "name": "value", "kind": "attribute", "lowerLimit": 1, "upperLimit": 1, "type": "String"}}];

	test("initialising Concrete meta meta model and arithmetic expressions meta model (test1.js)", function() {
			var metaModel = jsmf.ecore.createEPackageFromConcrete(metaModelJSON);
			ok(metaModel, "meta meta model initialised");
			equal(jsmf.util.countProperties(metaModel.classifiers), 9, "#meta meta classes correct");
			var classifierEClass = metaModel.classifiers['Classifier'];
			ok(classifierEClass.features['name'], "EClass 'Class' knows about its 'name' feature");
			var datatypeEClass = metaModel.classifiers['Datatype'];
			ok(datatypeEClass && datatypeEClass.name === 'Datatype', "EClass 'Datatype' loaded correctly");
			ok(datatypeEClass.allFeatures()['name'], "EClass 'Datatype' knows about its 'name' feature");
			var featuresFeature = metaModel.classifiers['Class'].features['features'];
			ok(featuresFeature instanceof jsmf.ecore.EFeature, "EFeature is reified");
			var modelResource = jsmf.emf.createEResource(modelJSON, metaModel);
			ok(modelResource, "meta model initialised");
			equal(modelResource.contents.length, 8, "#meta classes correct");
		});

})();
