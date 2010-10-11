steal.then(function() {
	/**
	 * @class DocumentJS.Tags.hide
	 * @tag documentation
	 * @parent DocumentJS.Tags 
	 * 
	 * Hides this class or constructor from the left hand side bar.
	 * 
	 * ###Example:
	 * 
	 * @codestart
	 * /*
	 *  * Checks if there is a set_<i>property</i> value.  If it returns true, lets it handle; otherwise
	 *  * saves it.
	 *  * @hide
	 *  * @param {Object} property
	 *  * @param {Object} value
	 *  *|
	 _setProperty: function( property, value, success, error, capitalized ) {
	 * @codeend
	 */
	DocumentJS.Tags.hide = {
		add: function( line ) {
			var m = line.match(/^\s*@hide/)
			if ( m ) {
				this.hide = true;
			}
		}
	};
})