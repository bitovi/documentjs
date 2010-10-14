steal.then(function() {
	/**
	 * @class DocumentJS.tags.scope
	 * @tag documentation
	 * @parent DocumentJS.tags 
	 * 
	 * Forces the current type to start scope. 
	 * 
	 * ###Example:
	 * 
	 * @codestart
	 * /**
     *  * @attribute convert
     *  * @scope
	 *  * An object of name-function pairs that are used to convert attributes.
	 *  * Check out [jQuery.Model.static.attributes]
	 *  * for examples.
	 *  *|
	 *  convert: {
	 *      "date": function( str ) {
	 *          return typeof str == "string" ? (Date.parse(str) == NaN ? null : Date.parse(str)) : str
	 *      },
	 *      "number": function( val ) {
	 *          return parseFloat(val)
	 *      },
	 *      "boolean": function( val ) {
	 *          return Boolean(val)
	 *      }
	 *  }
	 * @codeend 
	 */
	DocumentJS.tags.scope = {
		add: function( line ) {
			print("Scope! " + line)
			this.starts_scope = true;
		}
	};
})