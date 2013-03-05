steal(function() {
	/**
	 * @constructor documentjs/tags/release @release
	 * @release 3.3
	 * @parent DocumentJS
	 * Specifies the relase
	 *
	 */
	return {
		add: function( line ) {
			var m = line.match(/^\s*@release\s+(\S*)\s*$/);
			if ( m ) {
				this.release = m[1];
			}
		}
	};
})

