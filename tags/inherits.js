steal.then(function() {
	/**
	 * @class DocumentJS.tags.inherits
	 * @tag documentation
	 * @parent DocumentJS.tags 
	 * 
	 * Says current class or constructor inherits from another class or contructor.
	 *
	 * ###Example:
	 * 
	 * @codestart
	 * /*
	 *  * @class Client
	 *  * @inherits Person
	 *  * ...
	 *  *|
	 *  var client = new Client() {
	 *  ...
	 * @codeend
	 */
	DocumentJS.tags.inherits = {
		add: function( line ) {
			var m = line.match(/^\s*@\w+ ([\w\.]+)/)
			if ( m ) {
				this.inherits = m[1];
			}
		}
	};
})