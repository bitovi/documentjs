var tnd = require('./helpers/typeNameDescription')

/**
 * @constructor documentjs.tags.deprecated @deprecated 
 * @parent documentjs.tags
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
module.exports = {
	add: function(line, curData, scope, docMap){
		
		var noNameData = tnd(line, true);
		if(!noNameData || !noNameData.types || !noNameData.types[0] || !noNameData.types[0].type) {
			console.log("WARNING!!\n>"+line+"\nShould look like:\n`@deprecated {VERSION} DESCRIPTION`");
		} else {
			if(!this.deprecated){
				this.deprecated = [];
			}
			var deprecate = {
				version: noNameData.types[0].type,
				description: noNameData.description
			};
			this.deprecated.push(deprecate);
			return deprecate;
		}
		
		
	},
	addMore: function( line, last ) {
		if ( last ) last.description += "\n" + line;
	}
};

