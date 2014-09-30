	/**
	 * @constructor documentjs.tags.hide @hide
	 * @parent documentjs.tags
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
	 * 
	 * @signature `@hide SECTION`
	 * 
	 * Hides some section.  To hide the sidebar 
	 * write: `@@hide sidebar`. To hide the title write `@@hide title`.
	 */
	module.exports = {
		add: function( line ) {
			var m = line.match(/^\s*@hide\s*([\w\d]*)/);
			
			if ( m ) {
				var name = m[1]
				if(!name) {
					this.hide = true;
				} else {
					this["show"+name[0].toUpperCase()+name.substr(1).toLowerCase()] = false;
				}
			}
			
		}
	};
