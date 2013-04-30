$(document).ready( function() {

	$.get("test2/metaModel.json", function(metaModelText, status) {
		var metaModelJSON = $.parseJSON(metaModelText);

		$.get("test2/model.json", function(modelText, status) {
			var modelJSON = $.parseJSON(modelText);

			test("initialising statemachine meta model and example model (test2.js)", function() {
				var metaModel = jsmf.meta.createMetaModelFromJSON(metaModelJSON);
				ok(metaModel, "statemachine meta model initialised");
				var modelResource = jsmf.model.Factory.createMResource(modelJSON, metaModel, defaultValidationCallback);
				ok(modelResource, "example model initialised");
				var statemachine = modelResource.contents.at(0);
				var states = statemachine.get("states");
				var offState = states.at(0);
				var onState = states.at(1);
				var transition0 = offState.get("transitions").at(0);
				var referencedState = transition0.get("targetState");
				ok( referencedState === onState, "reference to On state resolved correctly");
				var json = modelResource.toJSON();
				deepEqual(json, modelJSON, "serialized model equals sanitized original JSON");
			});

		});

	});

});
