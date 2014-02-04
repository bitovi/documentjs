steal(function() {
	/**
	 * @constructor DocumentJS.tags.link @liink
	 * @tag documentation
	 * @parent DocumentJS
	 * 
	 * @description 
	 * 
	 * Adds a link in the "links" section.
	 * 
	 * ###Example:
	 * 
	 * @codestart
	 * /*
	 *  * @link ../docco/component.html source
	 *  *|
	 * @codeend
	 */
	return {
		add: function( line ) {
			var m = line.match(/^\s*@link\s*([^\s]+)\s+(.+)/)
			if ( m ) {
				if(!this.links){
					this.links = [];
				}
				this.links.push({
					href: m[1],
					title: m[2]
				});
			}
		}
	};
})