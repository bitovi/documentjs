steal('./helpers/getParent.js',
	'documentjs/tags/helpers/typeNameDescription.js',function(getParent, tnd) {


	/**
	 * @constructor DocumentJS.tags.function @function
	 * 
	 * @parent DocumentJS
	 * 
	 * @description Specifies the comment is for a function. Use [DocumentJS.tags.param @param] to
	 * specify the arguments of a function.
	 * 
	 * @signature `@function [NAME] [TITLE]`
	 * 
	 * @codestart
	 * /**
	 *  * @function lib.Component.prototype.update update
	 *  * @parent lib.Component
	 *  *|
	 * C.p.update = function(){
	 * 	 
	 * }
	 * @codeend
	 * 
	 * @param {String} [NAME] The name of the function. It should 
	 * be supplied if it can not be determined from the code block
	 * following the comment.
	 * 
	 * @param {String} [TITLE] The title to be used for display purposes.
	 * 
	 * @body
	 * 
	 * ## Code Matching
	 * 
	 * The `@function` type can be infered from code like the following:
	 * 
	 * @codestart
	 * /**
	 *  * The foo function exists
	 *  *|
	 * foo: function(){}
	 * /**
	 *  * The bar function exists
	 *  *|
	 * bar = function(){}
	 * @codeend
	 */
	return {
		codeMatch: /(?:([\w\.\$]+)|(["'][^"']+["']))\s*[:=]\s*function\s?\(([^\)]*)/,
		code: function( code, scope, docMap ) {
			
			
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
			this.title = data.description;
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
