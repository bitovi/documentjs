var _ = require('underscore');
var fs = require('fs');
var path = require('path');

exports.docsFilename = function (name) {
	return name.replace(/ /g, "_")
		.replace(/&#46;/g, ".")
		.replace(/&gt;/g, "_gt_")
		.replace(/\*/g, "_star_")
		.replace(/\//g, "|") + '.html';
}
exports.name = function (file) {
	return file.substring(0, file.lastIndexOf('.'));
}

exports.handlebarsHelpers = function (helpers, Handlebars) {
	if (helpers && Handlebars) {
		_.each(helpers, function (helper, name) {
			if (!Handlebars.helpers[name]) {
				Handlebars.registerHelper(name, helper);
			}
		});
	}
	return Handlebars;
}

exports.handlebarsPartials = function (folder, Handlebars) {
	var files = fs.readdirSync(folder);
	files.forEach(function (filename) {
		var template = fs.readFileSync(path.join(folder, filename));
		Handlebars.registerPartial(filename, template.toString());
	});
	return Handlebars;
}

exports.activateItems = function(tree, name) {
	var traverse = function(children) {
		var anyActive = false;
		_.each(children, function(child) {
			var active = false;
			if(child.children) {
				active = traverse(child.children);
			}
			child.active = active || child.name == name;
			if(child.active) {
				anyActive = true;
			}
		});

		return anyActive;
	}

	traverse(tree);

	return tree;
}

exports.menuTree = function (data) {
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
		value = _.extend({
			active: false
		}, value);

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
