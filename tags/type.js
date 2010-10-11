steal.then(function() {
	/**
	 * @class DocumentJS.Tags.type
	 * @tag documentation
	 * @parent DocumentJS.Tags 
	 * 
	 * Sets the type for the current commented code.
	 */
	DocumentJS.Tags.type = {
		add: function( line ) {
			var m = line.match(/^\s*@type\s*([\w\.\/]*)/)
			if ( m ) {
				this.attribute_type = m[0]
			}
		}
	};
})