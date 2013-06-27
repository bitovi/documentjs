steal(function() {
	/**
	 * @constructor DocumentJS.tags.alias @alias
	 * @tag documentation
	 * @parent DocumentJS
	 * 
	 * @description 
	 * 
	 * The Class or Constructor is known by another name.
	 * 
	 * @body
	 * 
	 * ###Example:
	 *  
	 * @codestart
	 * /*
	 *  * @alias WidgetFactory
	 *  *|
	 *  $.Class.extend("jQuery.Controller",
	 *  ...
	 * @codeend 
	 */
	return {
		add: function( line ) {
			var m = line.match(/^\s*@alias\s*([\w\-\.]*)/)
			if ( m ) {
				this.alias = m[1];
			}
		}
	};
})