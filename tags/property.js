steal('./helpers/getParent.js',
	'documentjs/tags/helpers/typeNameDescription.js',function(getParent, tnd) {
	/**
	 * @constructor DocumentJS.tags.property @property
	 * @parent DocumentJS
	 * 
	 * @description Documents a property of a parent object.
	 * 
	 * @signature `@property {TYPE} NAME [TITLE]` Documents a 
	 * property named `NAME` of type `{TYPE}`. 
	 * 
	 * @codestart
	 * /**
	 *  * @@property {Number} delay
	 *  * Sets the delay in milliseconds between an ajax request is made and
	 *  * the success and complete handlers are called.  This only sets
	 *  * functional fixtures.  By default, the delay is 200ms.
	 *  *|
	 * $.fixture.delay = 200
	 * @codeend
	 * 
	 * @param {documentjs/type} [TYPE] An optional type like `{Object}`.
	 * @param {documentjs/name} [NAME] The name of the property. This maybe infered from the 
	 * code block immediately following the comment.
	 * @param {STRING} [TITLE] The display title of the property.
	 * 
	 */
	return {
		codeMatch: function( code ) {
			return code.match(/(\w+)\s*[:=]\s*/) && !code.match(/(\w+)\s*[:=]\s*function\(([^\)]*)/)
		},
		code: function( code, scope, docMap ) {
			var parts = code.match(/(\w+)\s*[:=]\s*/);
			if ( parts ) {
				
				var props = {
					name: parts[1],
					type: "property"
				}
				if(scope && docMap) {
					var parentAndName = getParent.andName({
						parents: "*",
						useName: ["constructor","static","prototype","function"],
						scope: scope,
						docMap: docMap,
						name: props.name
					});
					props.name = parentAndName.name;
					props.parent = parentAndName.parent;
				}
				
				
				return props
			}
		},
		add: function(line, curData, scope, docMap){
			var data = tnd(line);
			this.types = data.types
			
			this.title = data.description;
			
			
			if(data.name){
				this.name = data.name;
			}
			this.type = "property";
		}
	}
})
