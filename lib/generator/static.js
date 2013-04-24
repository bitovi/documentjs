var fs = require('fs');
var path = require('path');
var _ = require('underscore');
var Handlebars = require('handlebars');
var async = require('async');
var utils = require('./utilities');

/**
 * Takes a given folder, loads a Handlebars template withing that
 * folder and renders all templates withing a pages directory using
 * that template and the given data. Write a list of files
 * and calls a callback with a list of generated filenames when
 * everything is done.
 *
 * @param {Object} options The options to set
 *  `folder` - The folder to run in
 *  `layout` - A link to the layout Handlebars template within that folder
 *  `pages` - The folder containing the pages to generate
 *  `out` - The output directory (same as `folder` by default)
 * @param {Object} data The data to render the templates with
 * @param {Function} callback The callback to call when everything
 * is done. If no error occurred, it will be called with
 * a list of the generated filenames.
 */
module.exports = function(options, callback) {
	options = _.defaults({
		layout: options.folder + '/_layouts/page.mustache',
		pages: options.folder + '/_pages/',
		out: options.folder,
		helpers: options.helpers
	}, options.static);

	utils.handlebarsHelpers(options.helpers, Handlebars);

	fs.readFile(options.layout, function(error, tpl) {
		if(error) {
			return callback(error);
		}

		var layout = Handlebars.compile(tpl.toString());
		fs.readdir(options.pages, function (error, files) {
			var writers = files.map(function (file) {
				return function(cb) {
					var source = fs.readFileSync(path.join(options.pages, file)).toString();
					var renderer = Handlebars.compile(source);
					var page = utils.name(file);
					var filename = path.join(options.out, page + '.html');
					var source = layout(_.defaults({
						root: '',
						page: page,
						content: renderer(options)
					}, options.data));

					fs.writeFile(filename, source, function (error) {
						cb(error, filename);
					});
				}
			});

			async.parallel(writers, callback);
		});
	});
}
