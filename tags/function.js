steal('./helpers/getParent.js',
	'documentjs/tags/helpers/typeNameDescription.js',function(getParent, tnd) {


	/**
	 * @constructor documentjs/tags/function @function
	 * @parent DocumentJS
	 * @signature `@function [NAME] [TITLE]`
	 * 
	 * @param {String} NAME
	 * @param {String} TITLE
	 * 
	 * 
	 * ## Code Matching
	 * 
	 *     foo: function(){}
	 *     foo = function(){}
	 */
	return {
		codeMatch: /(?:([\w\.\$]+)|(["'][^"']+["']))\s*[:=]\s*function\s?\(([^\)]*)/,
		code: function( code, scope, docMap ) {
			
			print("function code "+code)
			
			var parts = code.match(this.codeMatch);

			if (!parts ) {
				parts = code.match(/\s*function\s+([\w\.\$]+)\s*(~)?\(([^\)]*)/)
			}
			var data = {
				type: "function"
			};
			if (!parts ) {
				return;
			}
			data.name = parts[1] ? parts[1].replace(/^this\./, "").replace(/^\$./, "jQuery.") : parts[2];

			//clean up name if it has ""
			//if (/^["']/.test(data.name) ) {
			//	data.name = data.name.substr(1, data.name.length - 2).replace(/\./g, "&#46;").replace(/>/g, "&gt;");
			//}

			data.params = [];
			var params = parts[3].match(/\w+/g);

			if ( params ) {

				for ( var i = 0; i < params.length; i++ ) {
					data.params.push({
						name: params[i],
						types: [{type: "*"}]
					});
				}
			
			}
			
			
			
			// assign name and parent
			if(scope && docMap){
				var parentAndName = getParent.andName({
					parents: "*",
					useName: ["constructor","static","prototype"],
					scope: scope,
					docMap: docMap,
					name: data.name
				});

				data.parent = parentAndName.parent;
				data.name = parentAndName.name;
			}
			
			return data;
		},
		add: function(line, curData, scope, docMap){
			var data = tnd(line);
			this.description = data.description;
			if(data.name) {
				this.name = data.name;
			}
			this.type = "function";
			if(!data.params){
				data.params = [];
			}
		}
	}
})
