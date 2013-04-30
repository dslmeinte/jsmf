$(document).ready( function() {

	$.get("json/test3/metaModel.json", function(metaModelText, status) {
		var metaModelJSON = $.parseJSON(metaModelText);

		$.get("json/test3/model.json", function(modelText, status) {
			var modelJSON = $.parseJSON(modelText);

			test("initialising statemachine meta model and example model (test3.js) - with view info", function() {
				var metaModel = jsmf.meta.createMetaModelFromJSON(metaModelJSON);
				ok(metaModel, "statemachine meta model initialised");
				var modelResource = jsmf.model.Factory.createMResource(modelJSON, metaModel, defaultValidationCallback);
				ok(modelResource, "example model initialised");
			});

		});

	});

});
