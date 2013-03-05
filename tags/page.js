steal(function() {
	/**
	 * @constructor documentjs/tags/page @page
	 * @parent DocumentJS
	 */
	return {
		add: function( line ) {
			var m = line.match(/^\s*@\w+\s+([^\s]+)\s+(.+)/)
			if ( m ) {
				this.name = m[1];
				this.title = m[2] || this.name;
				this.type= "page"
			}
		}
	};
})