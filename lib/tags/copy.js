var _ = require('lodash');
/**
 * @constructor documentjs.tags.copy @copy
 *
 * @parent documentjs.tags
 *
 * @description The `@copy` tag duplicates a DocObject to be displayed
 * as the child of a different parent
 *
 * @signature `@copy [COPYOF] [NAME]`
 *
 * @param {DocObject} [COPYOF] The name of the DocObject that is
 * being duplicated.
 * 
 * @param {String} [NAME] The unique name of the copy
 */
module.exports = {
	add: function(line, curData, scope, docMap){
		var m = line.match(/^\s*@\w+\s+([^\s]+)(?:\s+(.+))?/),
				current = docMap[m[1]],
				copy = _.cloneDeep(current);

		if( m ){
			copy.parent = this.parent;
			copy.name = m[2];
			return ["scope", _.extend(this, copy)];
		}
	}
}