	/**
	 * @constructor DocumentJS.tags.link @link
	 * @tag documentation
	 * @parent DocumentJS.tags
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
	module.exports = {
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
