steal('../libs/underscore.js', '../libs/handlebars.js',
	'documentjs', '../site/utilities.js', '../site/defaults.js',
	'steal/rhino/json.js', function (_, Handlebars, documentjs, utils, defaults) {
	var generate = function (files, options) {
		var configuration = _.extend(defaults, options);
		if(!configuration.parent){
			throw "must provide a parent"
		}
		var layout = Handlebars.compile(readFile(configuration.layout));
		var renderer = Handlebars.compile(readFile(configuration.docs));
		var dir = new steal.URI(configuration.out);

		if (!dir.exists()) {
			dir.mkdirs();
		}

		utils.handlebarsHelpers(_.extend({}, utils.helpers, configuration.helpers), Handlebars);
		utils.handlebarsPartials(new steal.URI(configuration.docs).dir() + '/', Handlebars);
		documentjs(files, configuration, function (scripts, docData, search) {
			var rootItem = utils.menuTree(docData, configuration.parent);
			Handlebars.registerHelper('docLinks', function (text) {
				return utils.replaceLinks(text, docData);
			});
			_.each(docData, function (currentData, name) {
				if (!configuration.ignore(currentData, name)) {
					// Set the active item from the given name
					utils.activateItems(rootItem, name);

					var filename = configuration.out + '/' +
						(name === configuration.parent ? 'index.html' : utils.docsFilename(name));
					var data = _.extend({
						menu: rootItem
					}, configuration, currentData);
					print('Writing documentation ' + filename);

					if (options.debug) {
						data.debug = steal.toJSON(data);
					}
					var content = renderer(data);
					var contents = layout(_.extend({
						content: content
					}, data));

					new steal.URI(filename).save(contents);
				}
			});

			// copies resources folder to destination folder
			var resourcesDest = new steal.URI(configuration.out+'/resources');
			if (!resourcesDest.exists()) {
				resourcesDest.mkdirs();
			}
			new steal.URI('documentjs/site/resources').copyTo(resourcesDest)
		});
	}

	return generate;
});
