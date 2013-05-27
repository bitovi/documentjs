steal('../lib/underscore.js', '../lib/handlebars.js', 'documentjs/document.js', './utilities.js', 'steal/rhino/json.js', function (_, Handlebars, documentjs, utils) {
	var generate = function (files, options) {
		var configuration = _.extend({
			ignore: function (data) {
				return data.hide || data.type === 'script' ||
					data.type === 'static' ||
					data.type === 'prototype';
			}
		}, options);
		var layout = Handlebars.compile(readFile(configuration.layout));
		var renderer = Handlebars.compile(readFile(configuration.docs));
		var docFiles = _.filter(files, function (file) {
			return /(\.md)|(\.js)/.test(file);
		});
		var staticFiles = _.difference(files, docFiles);
		var dir = new steal.URI(configuration.out);

		if (!dir.exists()) {
			dir.mkdirs();
		}

		utils.handlebarsHelpers(_.extend({}, utils.helpers, options.helpers), Handlebars);
		utils.handlebarsPartials(new steal.URI(configuration.docs).dir() + '/', Handlebars);

		documentjs(docFiles, function (error, docData, search) {
			var rootItem = utils.menuTree(docData, configuration.parent);

			Handlebars.registerHelper('docLinks', function (text) {
				return utils.replaceLinks(text, docData);
			});

			staticFiles.forEach(function (file) {
				var source = readFile(file);
				var renderer = Handlebars.compile(source);
				var page = utils.name(new steal.URI(file).filename());
				var file = new steal.URI(configuration.out + '/' + page + '.html');

				print('Writing static page ' + file);

				var source = layout(_.defaults({
					root: configuration.root,
					page: page,
					content: renderer(configuration)
				}, configuration));

				file.save(source);
			});

			// Generates DocumentJS pages
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
						data.debug = steal.toJSON(currentData);
					}

					var contents = layout(_.extend({
						content: renderer(data)
					}, data));

					new steal.URI(filename).save(contents);
				}
			});
		});
	}

	return generate;
});
