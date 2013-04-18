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
			"name" : "chartElements",
			"kind" : "containment",
			"type" : "ChartElement"
		} ],
		"annotations": [ "_view" ]
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
		} ],
		"annotations": [ "_view" ]
	}, {
		"metaMetaType" : "Class",
		"name" : "ChartElement",
		"abstract" : true,
		"annotations": [ "_view" ]
	}, {
		"metaMetaType" : "Class",
		"name" : "State",
		"abstract" : true,
		"superTypes" : [ "ChartElement" ],
		"features" : [ {
			"name" : "name",
			"kind" : "attribute",
			"required" : true,
			"manyValued" : false,
			"type" : "String"
		} ],
		"annotations": [ "_view" ]
	}, {
		"metaMetaType" : "Class",
		"name" : "SimpleState",
		"superTypes" : [ "State" ]
	}, {
		"metaMetaType" : "Class",
		"name" : "CompositeState",
		"superTypes" : [ "State" ],
		"features" : [ {
			"name" : "chartElements",
			"kind" : "containment",
			"manyValued" : true,
			"type" : "ChartElement"
		} ]
	}, {
		"metaMetaType" : "Class",
		"name" : "Transition",
		"superTypes" : [ "ChartElement" ],
		"features" : [ {
			"name" : "sourceState",
			"kind" : "reference",
			"required" : true,
			"manyValued" : false,
			"type" : "State"
		}, {
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

	var modelJSON = [{
		  "metaType": "Statemachine",
		  "settings": {
		    "name": "AC",
		    "triggers": [
		      {
		        "metaType": "Trigger",
		        "settings": {"name": "OnButton"},
		        "_view": {"collapsed": false}
		      },
		      {
		        "metaType": "Trigger",
		        "settings": {"name": "ModeButton"},
		        "_view": {"collapsed": false}
		      }
		    ],
		    "chartElements": [
		      {
		        "metaType": "SimpleState",
		        "settings": {"name": "Off"},
		        "_view": {
		          "collapsed": false,
		          "position": {
		            "left": "15px",
		            "top": "46px"
		          }
		        }
		      },
		      {
		        "metaType": "CompositeState",
		        "settings": {
		          "name": "On",
		          "chartElements": [
		            {
		              "metaType": "SimpleState",
		              "settings": {"name": "Heating"},
		              "_view": {
		                "collapsed": false,
		                "position": {
		                  "left": "45px",
		                  "top": "54px"
		                }
		              }
		            },
		            {
		              "metaType": "SimpleState",
		              "settings": {"name": "Cooling"},
		              "_view": {
		                "collapsed": false,
		                "position": {
		                  "left": "442px",
		                  "top": "66px"
		                }
		              }
		            },
		            {
		              "metaType": "Transition",
		              "settings": {
		                "sourceState": {"hint": "/AC/On/Heating"},
		                "targetState": {"hint": "/AC/On/Cooling"},
		                "triggers": [{"hint": "/AC/ModeButton"}]
		              },
		              "_view": {
		                "position": {
		                  "left": "236px",
		                  "top": "4px"
		                },
		                "variant": 1
		              }
		            },
		            {
		              "metaType": "Transition",
		              "settings": {
		                "sourceState": {"hint": "/AC/On/Cooling"},
		                "targetState": {"hint": "/AC/On/Heating"},
		                "triggers": [{"hint": "/AC/ModeButton"}]
		              },
		              "_view": {
		                "position": {
		                  "left": "235px",
		                  "top": "82px"
		                },
		                "variant": 2
		              }
		            }
		          ]
		        },
		        "_view": {
		          "collapsed": false,
		          "position": {
		            "left": "397px",
		            "top": "-30px"
		          },
		          "container-size": {"chartElements": {
		            "width": "596px",
		            "height": "144px"
		          }}
		        }
		      },
		      {
		        "metaType": "Transition",
		        "settings": {
		          "sourceState": {"hint": "/AC/Off"},
		          "targetState": {"hint": "/AC/On/Heating"},
		          "triggers": [{"hint": "/AC/OnButton"}]
		        },
		        "_view": {
		          "position": {
		            "left": "214px",
		            "top": "93px"
		          },
		          "variant": 1
		        }
		      },
		      {
		        "metaType": "Transition",
		        "settings": {
		          "sourceState": {"hint": "/AC/On"},
		          "targetState": {"hint": "/AC/Off"},
		          "triggers": [{"hint": "/AC/OnButton"}]
		        },
		        "_view": {
		          "position": {
		            "left": "212px",
		            "top": "-19px"
		          },
		          "variant": 2
		        }
		      }
		    ]
		  },
		  "_view": {"container-size": {"chartElements": {
		    "width": "1553px",
		    "height": "211px"
		  }}}
		}];

	test("initialising statemachine meta model and example model (test3.js) - with view info", function() {
			var metaModel = jsmf.meta.createMetaModelFromJSON(metaModelJSON);
			ok(metaModel, "statemachine meta model initialised");
			var modelResource = jsmf.model.Factory.createMResource(modelJSON, metaModel, defaultValidationCallback);
			ok(modelResource, "example model initialised");
		});

})();
