var utils = require('./utilities');
var _ = require('underscore');
var path = require('path');

module.exports =  {
	activePage: function(current, expected) {
		return current == this.page ? 'active' : '';
	},

	url: function(url) {
		return path.join(this.root, url);
	},

	makeTypesString: function (types) {
		if (types.length) {
			// turns [{type: 'Object'}, {type: 'String'}] into '{Object | String}'
			return '{' + types.map(function (t) {
				return t.type;
			}).join(' | ') + '}';
		} else {
			return '';
		}
	},

	listOptions: function (types, options) {
		var out = [];
		types.forEach(function (type) {
			type.options.forEach(function (option) {
				out.push(options.fn(option));
			});
		});

		return out.join('');
	},

	contentList: function (page) {
		var out = [];

		return '';

		if(!page.signatures) {
			return '';
		}

		page.signatures.forEach(function (sig) {
			out.push(options.fn({text: sig.code, where: sig.code + '%0A%09%09%0A%09'}));
		});

		if (page.body.length) {
			var h2Find = /<h2>(.*?)<\/h2>/g,
				matches;
			while ((matches = h2Find.exec(page.body)) !== null) {
				out.push(options.fn({text: matches[1], where: matches[1].replace(/ /g, '+')}));
			}
		}

		return out.join('');
	},

	makeHref: function (name) {
		return utils.docsFilename(name);
	}
}