/**
 * @constructor documentjs.tags.alias @alias
 * @hide
 * @tag documentation
 * @parent documentjs.tags
 * 
 * @description 
 * 
 * The Class or Constructor is known by another name.
 * 
 * 
 * 
 * @body
 * 
 * ### Example:
 *  
 * @codestart javascript
 * /*
 *  * @alias WidgetFactory
 *  *|
 *  can.Class.extend("jQuery.Controller",
 *  ...
 * @codeend 
 */
module.exports = {
	add: function( line ) {
		var m = line.match(/^\s*@alias\s*([\w\-\.]*)/);
		if ( m ) {
			this.alias = m[1];
		}
	}
};
