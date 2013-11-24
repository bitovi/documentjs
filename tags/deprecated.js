steal('./helpers/typeNameDescription.js',function(tnd){
	/**
	 * @constructor DocumentJS.tags.deprecated @deprecated 
	 * @parent DocumentJS
	 * 
	 * @description 
	 * 
	 * Marks some comment as deprecated.
	 * 
	 * 
	 * @signature `@deprecated {VERSION} DESCRIPTION`
	 * 
	 * @param {STRING} VERSION The version the 
	 * deprecation occured within.
	 * 
	 * @param {STRING} DESCRIPTION Text describing
	 * the deprecation.
	 * 
	 * 
	 * @body
	 * 
	 * 
	 */
	return {
		add: function(line, curData, scope, docMap){
			
			var noNameData = tnd(line, true)
			
			if(!this.deprecated){
				this.deprecated = [];
			}
			var deprecate = {
				version: noNameData.types[0].type,
				description: noNameData.description
			}
			this.deprecated.push(deprecate);
			return deprecate;
		},
		addMore: function( line, last ) {
			if ( last ) last.description += "\n" + line;
		}
	}
})
