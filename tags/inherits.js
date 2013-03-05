steal(function() {
	/**
	 * @constructor documentjs/tags/inherits @inherits
	 * @tag documentation
	 * @parent DocumentJS
	 * 
	 * Says current class inherits from another class.
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
	return {
		add: function( line ) {
			var m = line.match(/^\s*@\w+ ([\w\.\$]+)/)
			if ( m ) {
				this.inherits = m[1];
			}
		}
	};
})