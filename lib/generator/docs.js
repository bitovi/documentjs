var fs = require('fs');
var path = require('path');
var _ = require('underscore');
var async = require('async');
var Handlebars = require('handlebars');
var documentjs = require('../document.js');
var utils = require('./utilities');

/**
 * Takes a list of files and generates the documentation
 *
 * @param files
 * @param options
 * @param callback
 */
module.exports = function (files, options, callback) {
	options = _.defaults({
		layout: options.folder + '/_layouts/page.mustache',
		docs: options.folder + '/_docs/page.mustache',
		out: options.folder + '/docs/',
		helpers: options.helpers,
		ignore: function (data) {
			return data.type === 'script' ||
				data.type === 'static' ||
				data.type === 'prototype';
		}
	}, options.docs);

	var layout = Handlebars.compile(fs.readFileSync(options.layout).toString());
	var renderer = Handlebars.compile(fs.readFileSync(options.docs).toString());

	if (!fs.existsSync(options.out)) {
		fs.mkdirSync(options.out);
	}

	utils.handlebarsPartials(path.dirname(options.docs) + '/', Handlebars);

	documentjs(files, function (error, data, search) {
		var writers = [];
		var tree = utils.menuTree(data);
		var rootItem = _.find(tree, function (current) {
			return current.name == options.parent || current.title == options.parent;
		});

		writers.push(function(callback) {
			var filename = path.join(options.out, 'searchdata.json');
			fs.writeFile(filename, JSON.stringify(search), function(error) {
				callback(error, filename);
			});
		});

		_.each(data, function (docData, name) {
			if (!options.ignore(docData, name)) {
				writers.push(function (callback) {
					// Set the active item from the given name
					utils.activateItems(tree, name);

					var filename = path.join(options.out, (name === options.parent ? 'index.html' : utils.docsFilename(name)));
					var data = _.extend({
						menu: rootItem
					}, docData);

					if(options.debug) {
						data.debug = JSON.stringify(docData);
					}

					var contents = layout(_.extend({
						root: options.root || '',
						page: options.page || 'docs',
						content: renderer(data)
					}, options.data));

					fs.writeFile(filename, contents, function (error) {
						callback(error, filename);
					});
				});
			}
		});

		async.parallel(writers, callback);
	});
}