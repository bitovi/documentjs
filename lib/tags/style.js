var getParent = require('./helpers/getParent'),
		tnd = require('./helpers/typeNameDescription'),

	keyFunction = /(?:([\w\.\$]+)|(["'][^"']+["']))\s*[:=].*style\s?\(([^\)]*)/,
	namedFunction = /\s*style\s+([\w\.\$]+)\s*(~)?\(([^\)]*)/;

/**
 * @constructor documentjs.tags.style @style
 *
 * @parent documentjs.tags
 *
 * @description
 *
 * @signature `@style [NAME]`
 *
 * @param {String} [NAME] The name of the component. The name is used
 * as a reference for other tags
 *
 * @param {String} [TITLE] The title to be used for display purposes
 */
module.exports = {
	add: function(line){
		var data = tnd(line);
		this.title = data.description;
		this.name = data.name;
		this.type = "style";
		if(!data.params){
			data.params = [];
		}
	}
}