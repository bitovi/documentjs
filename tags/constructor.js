steal('./helpers/getParent.js',
	'documentjs/tags/helpers/typeNameDescription.js',function(getParent, tnd) {

	var funcMatch = /(?:([\w\.\$]+)|(["'][^"']+["']))\s*[=]\s*function\s?\(([^\)]*)/,
		codeMatch = /([\w\.\$]+?).extend\(\s*["']([^"']*)["']/

	/**
	 * @constructor DocumentJS.tags.constructor @constructor
	 * 
	 * Document a constructor function.
	 * 
	 * @signature `@constructor NAME [TITLE]`
	 * @parent DocumentJS
	 */
	return {
		codeMatch: function(code){
			return codeMatch.test(code) || funcMatch.test(code);
		},
		code: function( code ) {

			var parts = code.match(codeMatch);
			if ( parts ) {
				return {
					name: parts[2],
					inherits: parts[1].replace(/^\$./, "jQuery."),
					type: "constructor"
				}
			}
			parts = code.match(funcMatch)
			
			if ( parts ) {
				return {
					name: parts[1] ? parts[1].replace(/^this\./, "") : parts[2],
					type: "constructor"
				}
			}
		},
		codeScope: true,
		add: function(line, curData, scope, docMap){
			
			// it's possible this has already been matched as something else ... clear parent
			
			this.type = "constructor";
			var data = tnd(line);
			if(data.name) {
				this.name = data.name;
			}
			
			this.title = data.description;
			return ["scope",this];
		}
	}
})
