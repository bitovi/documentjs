steal(function() {
	/**
	 * @class DocumentJS.tags.release
	 * @tag documentation
	 * @parent DocumentJS.tags 
	 * Specifies the relase
	 *
	 */
	return {
		add: function( line ) {
			var m = line.match(/^\s*@release\s*(.*)/)
			if ( m ) {
				console.log("M: " + m);
				this.release = m[1];
			}
		}
	};
})

