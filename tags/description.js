	/**
	 * @constructor DocumentJS.tags.description @description
	 * @tag documentation
	 * @parent DocumentJS.tags 
	 * 
	 * @description Provide a short description.
	 * 
	 * 
	 * @signature `@description CONTENT`
	 * 
	 * @codestart
	 * /**
	 *  * @signature `new lib.Component(name)`
	 *  * @description A component for the lib library.
	 *  *|
	 * lib.Component = function(name){}
	 * @codeend
	 * 
	 * 
	 * @body
	 * 
	 * The text following `@description` is added at the top
	 * of the documentation page. By default any text
	 * in a comment that isn't after a multi-line `@` directive is added to 
	 * the `description` of the [documentjs/DocObject DocObject]. `@description`
	 * can be used to escape a multi-line `@` directive.
	 * 
	 */
	module.exports = {
		add: function( line ) {
			var m = line.match(/^\s*@description\s*(.*)/)
			if ( m ) {
				this.description = m[1]+" ";
				return ["default","description"]
			}
		}
	};
