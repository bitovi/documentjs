var fs = require('fs');
var path = require('path');
var _ = require('underscore');
var async = require('async');
var Handlebars = require('handlebars');
var documentjs = require('../document.js');
var utils = require('./utilities');
var beautify = require('js-beautify').js_beautify;

/**
 * Takes a list of files and generates the documentation
 *
 * @param files
 * @param configuration
 * @param callback
 */
module.exports = function (files, options, callback) {
	var configuration = _.extend({
		layout: options.folder + '/_layouts/page.mustache',
		docs: options.folder + '/_docs/page.mustache',
		out: options.folder + '/docs/',
		ignore: function (data) {
			return data.type === 'script' ||
				data.type === 'static' ||
				data.type === 'prototype';
		}
	}, options.docs);


	var layout = Handlebars.compile(fs.readFileSync(configuration.layout).toString());
	var renderer = Handlebars.compile(fs.readFileSync(configuration.docs).toString());

	if (!fs.existsSync(configuration.out)) {
		fs.mkdirSync(configuration.out);
	}

	utils.handlebarsPartials(path.dirname(configuration.docs) + '/', Handlebars);

	documentjs(files, function (error, data, search) {
		var writers = [];
		var rootItem = utils.menuTree(data, configuration.parent);

		writers.push(function(callback) {
			var filename = path.join(configuration.out, 'searchdata.json');
			fs.writeFile(filename, JSON.stringify(search), function(error) {
				callback(error, filename);
			});
		});

		if(options.debug) {
			fs.writeFileSync(path.join(configuration.out, 'documentjs-debug.json'), beautify(JSON.stringify(data)));
			fs.writeFileSync(path.join(configuration.out, 'rootItem-debug.json'), beautify(JSON.stringify(rootItem)));
		}

		_.each(data, function (docData, name) {
			if (!configuration.ignore(docData, name)) {
				writers.push(function (callback) {
					// Set the active item from the given name
					utils.activateItems(rootItem, name);

					var filename = path.join(configuration.out, (name === configuration.parent ? 'index.html' : utils.docsFilename(name)));
					var data = _.extend({
						menu: rootItem
					}, docData);

					if(options.debug) {
						data.debug = beautify(JSON.stringify(docData));
					}

					var contents = layout(_.extend({
						root: configuration.root || '',
						page: configuration.page || 'docs',
						content: renderer(data)
					}, configuration.data));

					fs.writeFile(filename, contents, function (error) {
						callback(error, filename);
					});
				});
			}
		});

		async.parallel(writers, callback);
	});
}