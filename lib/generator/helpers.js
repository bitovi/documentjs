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

	makeHref: function (name) {
		return utils.docsFilename(name);
	}
}