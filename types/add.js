/**
 * @class DocumentJS.Type.types.add
 * @tag documentation
 * @parent DocumentJS.Type
 * Used to set scope to add to classes or methods in another file. Examples:
 * 
 * @codestart
 * /* @add steal.String Static *|         adds to steal.String's static methods
 * /* @add steal.Controller Prototype *|  adds to steal.Controller's prototype methods
 * @codeend
 * 
 * It's important to note that add must be in its own comment block. 
 */
DocumentJS.Type("add",
/**
 * @Static
 */
{
	/**
	 * Code parser.
	 */	
	code : function(){
		
	},
	/**
	 * @constructor
	 * @param {Object} type data
	 */	
	init : function(props){
		if(!DocumentJS.Application.objects[props.name]){
			DocumentJS.Application.objects[props.name] = props;
		}
		return DocumentJS.Application.objects[props.name];
	},
	/*
	 * Possible scopes for @add.
	 */
	parent : /script/,
	useName : true,
	hasChildren : true
})
