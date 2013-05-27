steal(function() {
	/**
	 * @constructor DocumentJS.tags.hide @hide
	 * @parent DocumentJS
	 * 
	 * Hides the comment from the navigation.
	 * 
	 * @signature `@hide`
	 * 
	 * @codestart
	 * /**
	 *  * Checks if there is a set_property value.  
	 *  * If it returns true, lets it handle; otherwise saves it.
	 *  * @@hide
	 *  *|
	 *  _setProperty: function( prop ) {
	 * @codeend
	 */
	return  {
		add: function( line ) {
			var m = line.match(/^\s*@hide/)
			if ( m ) {
				this.hide = true;
			}
		}
	};
})