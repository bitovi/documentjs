steal('./helpers/getParent.js',
	'documentjs/tags/helpers/typeNameDescription.js',function(getParent, tnd) {
	/**
	 * @constructor documentjs/tags/property @property
	 * @parent DocumentJS
	 * 
	 * @description Documents a property of a parent object.
	 * 
	 * @signature `@property {TYPE} NAME DESCRIPTION` Documents a 
	 * property named `NAME` of type `{TYPE}`. 
	 * 
	 * @codestart
	 * /**
	 *  * @@attribute {Number} delay
	 *  * Sets the delay in milliseconds between an ajax request is made and
	 *  * the success and complete handlers are called.  This only sets
	 *  * functional fixtures.  By default, the delay is 200ms.
	 *  *|
	 * $.fixture.delay = 200
	 * @codeend
	 * 
	 * @param {String} [TYPE] An optional type like `{Object}`.
	 * @param {STRING} [NAME] The name of the property. This maybe infered from the 
	 * code block immediately following the comment.
	 * @param {STRING} [DESCRIPTION] The text description of the property.
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
			
			this.description = data.description;
			
			
			if(data.name){
				this.name = data.name;
			}
			this.type = "property";
		}
	}
})
