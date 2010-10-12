steal.then(function() {
	/**
	 * @class DocumentJS.Tags.inherits
	 * @tag documentation
	 * @parent DocumentJS.Tags 
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
	DocumentJS.Tags.inherits = {
		add: function( line ) {
			var m = line.match(/^\s*@\w+ ([\w\.]+)/)
			if ( m ) {
				this.inherits = m[1];
			}
		}
	};
})