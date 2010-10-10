/**
 * @class DocumentJS.Type.types.static
 * @tag documentation
 * @parent DocumentJS.Type
 * Sets the following functions and attributes to be added to Class or Constructor static (class) functions.
 * 
 * ###Example
 * 
 * @codestart
 * /* @static *|
 * @codeend
 */
DocumentJS.Type("static",
/*
 * @Static
 */
{
	/*
	 * @return {Object} prototype data.
	 */	
	code : function(){
		return {name: "static"}
	},
	/*
	 * Possible scopes for @static.
	 */	
	parent : /script|class/,
	useName : true,
	hasChildren : true
})