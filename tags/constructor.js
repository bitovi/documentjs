steal.then(function() {
	/**
	 * @class DocumentJS.Tags.constructor
	 * @tag documentation
	 * @parent DocumentJS.Tags
	 *   
	 * Documents the class initialization function (constructor). 
	 * 
	 * ###Example:
	 * 
	 * @codestart
	 * /**
     *  * @class jQuery.Hover
     *  * ...
     *  * @constructor Creates a new hover.  This is never
     *  * called directly.
     *  *|
     *  jQuery.Hover = function(){
	 * @codeend
	 */
	DocumentJS.Tags.constructor =
/*
 * @Static
 */
	{
		add: function( line ) {
			var parts = line.match(/\s?@constructor(.*)?/);

			this.construct = parts && parts[1] ? " " + parts[1] + "\n" : ""
			return ["default", 'construct'];
		}
	};
})