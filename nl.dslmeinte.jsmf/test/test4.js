$(document).ready( function() {

	$.get("json/test4/metaModel.json", function(metaModelText, status) {
		var metaModelJSON = $.parseJSON(metaModelText);

		$.get("json/test4/model.json", function(modelText, status) {
			var modelJSON = $.parseJSON(modelText);

			test("initialising arithmetic expressions meta model and example model (test4.js)", function() {
				var metaModel = jsmf.meta.createMetaModelFromJSON(metaModelJSON);
				ok(metaModel, "arithmetic expressions meta model initialised");
				var modelResource = jsmf.model.Factory.createMResource(modelJSON, metaModel, defaultValidationCallback);
				ok(modelResource, "example model initialised");
			});

		});

	});

});
