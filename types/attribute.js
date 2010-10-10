/**
 * @class DocumentJS.Attribute
 * @tag documentation
 * @parent DocumentJS.Type
 * Properties of an object.
 */
DocumentJS.Type("attribute",
/**
 * @Static
 */
{
	/*
	 * Checks if code matches the attribute type.
	 * @param {String} code
	 * @return {Boolean} true if code matches an attribute
	 */
	codeMatch: function(code){
		return code.match(/(\w+)\s*[:=]\s*/) && !code.match(/(\w+)\s*[:=]\s*function\(([^\)]*)/)  
	},
	/*
	 * Must return the name if from the code.
	 * @param {String} code
	 * @return {Object} type data 
	 */
	code : function(code){
		var parts = code.match(/(\w+)\s*[:=]\s*/);
        if(parts){
			return {
				name: parts[1]
			}
		}
	},
	/*
	 * Possible scopes for @attribute.
	 */
	parent : /script|static|proto|class/,
	useName : false
});