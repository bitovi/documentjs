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
			Handlebars.registerHelper(name, helper);
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

exports.activateItems = function (root, name) {
	var traverse = function (children) {
		var anyActive = false;
		_.each(children, function (child) {
			var active = false;
			if (child.children) {
				active = traverse(child.children);
			}
			child.active = active || child.name == name;
			if (child.active) {
				anyActive = true;
			}
		});

		return anyActive;
	}

	traverse(root.children);

	return root;
}

exports.menuTree = function (data, root) {
	var copies = _.map(data, function (value) {
		return _.extend({
			active: false
		}, value);
	});

	_.each(copies, function (current, index, arr) {
		var parent = _.find(arr, function (value) {
			return value.name === current.parent;
		});

		if (parent) {
			parent.children = parent.children || [];
			parent.children.push(current);
			parent.children = _.sortBy(parent.children, function (child) {
				return child.order || child.name;
			});
		}
	});

	if (root) {
		return _.find(copies, function (current) {
			return current.name == root;
		});
	}

	return copies;
}

exports.replaceLinks = function (text, data) {
	var replacer = function (match, content) {
		var parts = content.match(/^(\S+)\s(.*)/);
		var link = parts ? parts[1].replace('::', '.prototype.') : content;
		var description = parts && parts[2] ? parts[2] : link;

		if (data[link]) {
			return '<a href="' + exports.docsFilename(link) + '">' + description + '</a>';
		}

		return match;
	};

	return text.replace(/[\[](.*?)\]/g, replacer);
}

exports.helpers = {
	activePage: function(current, expected) {
		return current == this.page ? 'active' : '';
	},

	url: function(url) {
		return path.join(this.root, url);
	},

	makeHref: function (name) {
		return exports.docsFilename(name);
	}
};
