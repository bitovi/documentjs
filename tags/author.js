/**
 * @constructor DocumentJS.tags.author @author
 * @tag documentation
 * @parent DocumentJS.tags
 * 
 * @description 
 * 
 * Describes who the author of a class is.
 * 
 * ###Example:
 * 
 * @codestart
 * /*
 *  * @author Justin Meyer
 *  * @author Brian Moschel
 *  *|
 * @codeend
 */
module.exports = {
	add: function( line ) {
		var m = line.match(/^\s*@author\s*(.*)/)
		if ( m ) {
			this.author = m[1];
		}
	}
};
