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
			"required" : true,
			"manyValued" : false,
			"type" : "Expression"
		} ]
	}, {
		"metaMetaType" : "Class",
		"name" : "Fraction",
		"superTypes" : [ "Expression" ],
		"features" : [ {
			"name" : "expr1",
			"kind" : "containment",
			"required" : true,
			"manyValued" : false,
			"type" : "Expression"
		}, {
			"name" : "expr2",
			"kind" : "containment",
			"required" : true,
			"manyValued" : false,
			"type" : "Expression"
		} ]
	}, {
		"metaMetaType" : "Class",
		"name" : "Mult",
		"superTypes" : [ "Expression" ],
		"features" : [ {
			"name" : "expr1",
			"kind" : "containment",
			"required" : true,
			"manyValued" : false,
			"type" : "Expression"
		}, {
			"name" : "expr2",
			"kind" : "containment",
			"required" : true,
			"manyValued" : false,
			"type" : "Expression"
		} ]
	}, {
		"metaMetaType" : "Class",
		"name" : "Plus",
		"superTypes" : [ "Expression" ],
		"features" : [ {
			"name" : "expr1",
			"kind" : "containment",
			"required" : true,
			"manyValued" : false,
			"type" : "Expression"
		}, {
			"name" : "expr2",
			"kind" : "containment",
			"required" : true,
			"manyValued" : false,
			"type" : "Expression"
		} ]
	}, {
		"metaMetaType" : "Class",
		"name" : "Neg",
		"superTypes" : [ "Expression" ],
		"features" : [ {
			"name" : "expr",
			"kind" : "containment",
			"required" : true,
			"manyValued" : false,
			"type" : "Expression"
		} ]
	}, {
		"metaMetaType" : "Class",
		"name" : "Value",
		"superTypes" : [ "Expression" ],
		"features" : [ {
			"name" : "value",
			"kind" : "attribute",
			"required" : true,
			"manyValued" : false,
			"type" : "String"
		} ]
	} ];

	var modelJSON = [{
		  "metaType": "Sqrt",
		  "settings": {"expr": {
		    "metaType": "Fraction",
		    "settings": {
		      "expr1": {
		        "metaType": "Mult",
		        "settings": {
		          "expr1": {
		            "metaType": "Value",
		            "settings": {"value": "33"}
		          },
		          "expr2": {
		            "metaType": "Sqrt",
		            "settings": {"expr": {
		              "metaType": "Fraction",
		              "settings": {
		                "expr1": {
		                  "metaType": "Value",
		                  "settings": {"value": "5"}
		                },
		                "expr2": {
		                  "metaType": "Plus",
		                  "settings": {
		                    "expr1": {
		                      "metaType": "Value",
		                      "settings": {"value": "100"}
		                    },
		                    "expr2": {
		                      "metaType": "Value",
		                      "settings": {"value": "7"}
		                    }
		                  }
		                }
		              }
		            }}
		          }
		        }
		      },
		      "expr2": {
		        "metaType": "Value",
		        "settings": {"value": "6"}
		      }
		    }
		  }}
		}];

	test("initialising arithmetic expressions meta model and example model (test4.js)", function() {
			var metaModel = jsmf.meta.createMetaModelFromJSON(metaModelJSON);
			ok(metaModel, "arithmetic expressions meta model initialised");
			var modelResource = jsmf.model.Factory.createMResource(modelJSON, metaModel, defaultValidationCallback);
			ok(modelResource, "example model initialised");
		});

})();
