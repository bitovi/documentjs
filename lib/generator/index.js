var fs = require('fs');
var path = require('path');
var _ = require('underscore');
var async = require('async');
var Handlebars = require('handlebars');
var documentjs = require('../document');
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
		ignore: function (data) {
			return data.hide || data.type === 'script' ||
				data.type === 'static' ||
				data.type === 'prototype';
		}
	}, options);
	var jsonWriter = function(file, jsonData) {
		return function(callback) {
			var filename = path.join(configuration.out, file);
			fs.writeFile(filename, beautify(JSON.stringify(jsonData)), function(error) {
				callback(error, filename);
			});
		}
	}
	var layout = Handlebars.compile(fs.readFileSync(configuration.layout).toString());
	var renderer = Handlebars.compile(fs.readFileSync(configuration.docs).toString());
	var docFiles = _.filter(files, function(file) {
		return /(\.md)|(\.js)/.test(file);
	});
	var staticFiles = _.difference(files, docFiles);

	if (!fs.existsSync(configuration.out)) {
		fs.mkdirSync(configuration.out);
	}

	utils.handlebarsHelpers(_.extend({}, utils.helpers, options.helpers), Handlebars);
	utils.handlebarsPartials(path.dirname(configuration.docs) + '/', Handlebars);

	documentjs(docFiles, function (error, docData, search) {
		var writers = [];
		var rootItem = utils.menuTree(docData, configuration.parent);

		Handlebars.registerHelper('docLinks', function(text) {
			return utils.replaceLinks(text, docData);
		});

		// Write searchdata only if we have files do document
		if(docFiles.length) {
			writers.push(jsonWriter('searchdata.json', search));

			// Write JSON files for debugging
			if(options.debug) {
				writers.push(jsonWriter('documentjs-debug.json', docData), jsonWriter('rootItem-debug.json', rootItem));
			}
		}

		// Generates static pages
		writers.push.apply(writers, staticFiles.map(function(file) {
			return function(cb) {
				fs.readFile(file, function(error, data) {
					if(error) {
						return cb(error);
					}

					var source = data.toString();
					var renderer = Handlebars.compile(source);
					var page = utils.name(path.basename(file));
					var filename = path.join(configuration.out, page + '.html');
					var source = layout(_.defaults({
						root: configuration.root,
						page: page,
						content: renderer(configuration)
					}, configuration));

					fs.writeFile(filename, source, function (error) {
						cb(error, filename);
					});
				});
			}
		}));

		// Generates DocumentJS pages
		_.each(docData, function (currentData, name) {
			if (!configuration.ignore(currentData, name)) {
				writers.push(function (callback) {
					// Set the active item from the given name
					utils.activateItems(rootItem, name);

					var filename = path.join(configuration.out,
							(name === configuration.parent ? 'index.html' : utils.docsFilename(name)));
					var data = _.extend({
						menu: rootItem
					}, configuration, currentData);

					if(options.debug) {
						data.debug = beautify(JSON.stringify(currentData));
					}

					var contents = layout(_.extend({
						content: renderer(data)
					}, data));

					fs.writeFile(filename, contents, function (error) {
						callback(error, filename);
					});
				});
			}
		});

		// Now let all file writers (a list of callback functions) run in parallel
		async.parallel(writers, callback);
	});
}
