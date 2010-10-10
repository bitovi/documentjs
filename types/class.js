/**
 * @class DocumentJS.Class
 * @tag documentation
 * @parent DocumentJS.Type
 * Documents a class.
 */
DocumentJS.Type("class",
/**
 * @Static
 */
{	
	codeMatch: /([\w\.\$]+?).extend\(\s*["']([^"']*)["']/,  // /([\w\.]*)\s*=\s*([\w\.]+?).extend\(/,
	//must return the name if from the code
	funcMatch : /(?:([\w\.]+)|(["'][^"']+["']))\s*[:=]\s*function\s?\(([^\)]*)/,
	/*
	 * Parses the code to get the class data.
	 * @param {String} code
	 * @return {Object} class data
	 */
	code : function(code){
		var parts = code.match(this.codeMatch);
		if(parts){
			return {
				name: parts[2],
				inherits: parts[1].replace("$.","jQuery.")
			}
		};
		parts = code.match(this.funcMatch)
		if(parts){
			return {
				name: parts[1] ? parts[1].replace(/^this\./,"") : parts[2]
			}
		}
	},
	/*
	 * Possible scopes for @class.
	 */	
	parent : /script/,
	useName : true,
	hasChildren : true
})