var fs = require('fs');
var path = require('path');
var _ = require('underscore');
var Handlebars = require('handlebars');
var documentjs = require('./document.js');

function getNameFromFile(file) {
	return file.substring(0, file.lastIndexOf('.'));
}

// DocumentJS static page generator
function staticPages(folder, data, callback) {
	var template = path.join(folder, '/_layouts/page.mustache');
	var pagePath = path.join(folder, '/_pages/');

	if (!fs.existsSync(template)) {
		throw new Error('Could not find page template ' + template);
	}

	var layout = Handlebars.compile(fs.readFileSync(template).toString());

	fs.readdir(pagePath, function (error, files) {
		files.forEach(function (file) {
			var source = fs.readFileSync(path.join(pagePath, file)).toString();
			var renderer = Handlebars.compile(source);
			var page = getNameFromFile(file);
			var filename = path.join(folder, '/' + page + '.html');
			var source = layout(_.extend({
				root: '',
				page: page,
				content: renderer(data)
			}, data));

			fs.writeFile(filename, source, function () {
				console.log('Wrote filename ' + filename);
			});
		});
	});
}

function document(files, folder, callback) {
	documentjs(files, function (error, data, search) {
		var docPath = path.join(folder, '_docs');
		var pageTemplate = path.join(folder, '/_layouts/page.mustache');
		var documentationTemplate = path.join(folder, '/_layouts/docs.mustache');
		var pageRenderer = Handlebars.compile(fs.readFileSync(pageTemplate).toString());
		var docRenderer = Handlebars.compile(fs.readFileSync(documentationTemplate).toString());
		var renderers = {};
		var menu = generateMenu(data)[0].children;
		console.log(generateMenu(data));

		fs.readdir(docPath, function(error, files) {
			files.forEach(function(f) {
				var contents = fs.readFileSync(path.join(docPath, f)).toString();
				renderers[getNameFromFile(f)] = Handlebars.compile(contents);
			});
			_.each(data, function(docData, name) {
				var filename = path.join(folder, 'docs', name.replace(/ /g, "_")
					.replace(/&#46;/g, ".")
					.replace(/&gt;/g, "_gt_")
					.replace(/\*/g, "_star_")
					.replace(/\//g,"|") + '.html');
				var renderer = renderers[docData.type];

				if(renderer) {
					var contents = pageRenderer({
						root: '../',
						page: 'api',
						content: docRenderer({
							menu: menu,
							content: renderer(docData)
						})
					});
					fs.writeFile(filename, contents, function(error, data) {
						console.log('Wrote ' + filename);
					});
				}
			});
		});
	});
}

function generateMenu(data) {
	var transformed = [];
	var findParent = function (children, parent) {
		var result = null;
		_.each(children, function (obj) {
			if (obj.name === parent) {
				result = obj;
				return;
			}
			if (obj.children && obj.children.length) {
				result = findParent(obj.children, parent);
			}
		});

		return result;
	}

	_.each(_.values(data), function (value) {
		if (value.type === 'script') {
			return;
		}

		var parent = findParent(transformed, value.parent);
		if (!parent) {
			return transformed.push(value);
		}
		if (!parent.children) {
			parent.children = [];
		}

		if (value.type !== 'script') {
			parent.children.push(value);
		}
	});

	return transformed;
}

var dir = __dirname + '/../canjs.us/';

document(['../can/can.md', '../can/construct/construct.md', '../can/construct/construct.js',
	'../can/construct/proxy/proxy.md', '../can/control/control.md', '../can/control/control.js' ], dir);

staticPages(dir, {
	link: {}
});
