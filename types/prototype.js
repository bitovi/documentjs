/**
 * @class DocumentJS.Type.types.prototype
 * @tag documentation
 * @parent DocumentJS.Type
 * Sets the following functions and attributes to be added to Class or Constructor prototype (instance) functions.
 * 
 * ###Example
 * 
 * @codestart
 * /* prototype *|
 * @codeend
 */
DocumentJS.Type("prototype",
/*
 * @Static
 */
{
	/*
	 * @return {Object} prototype data.
	 */
	code : function(){
		return {name: "prototype"}
	},
	/*
	 * Possible scopes for @prototype.
	 */	
	parent : /script|class/,
	useName : true,
	hasChildren : true
})