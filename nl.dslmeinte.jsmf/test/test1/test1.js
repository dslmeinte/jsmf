$(document).ready( function() {

	$.get("test1/metaModel.json", function(metaModelText, status) {
		var metaModelJSON = $.parseJSON(metaModelText);

		$.get("test1/model.json", function(modelText, status) {
			var modelJSON = $.parseJSON(modelText);

			test("initialising Concrete meta meta model and arithmetic expressions meta model (test1.js)", function() {
				var metaModel = jsmf.meta.createMetaModelFromJSON(metaModelJSON);
				ok(metaModel, "meta meta model initialised");
				equal(jsmf.util.testing.countProperties(metaModel.classifiers), 9, "#meta meta classes correct");
				var classifierClass = metaModel.classifiers['Classifier'];
				ok(classifierClass.features['name'], "Meta type 'Class' knows about its 'name' feature");
				var datatypeMetaType = metaModel.classifiers['Datatype'];
				ok(datatypeMetaType && datatypeMetaType.name === 'Datatype', "Meta type 'Datatype' loaded correctly");
				ok(datatypeMetaType.allFeatures()['name'], "Meta type 'Datatype' knows about its 'name' feature");
				var featuresFeature = metaModel.classifiers['Class'].features['features'];
				ok(featuresFeature instanceof jsmf.meta.Feature, "Feature is reified");
				var modelResource = jsmf.model.Factory.createMResource(modelJSON, metaModel, defaultValidationCallback);
				ok(modelResource, "meta model initialised");
				equal(modelResource.contents.size(), 8, "#meta classes correct");
			});

		});

	});

});
