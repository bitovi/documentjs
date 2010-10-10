/**
 * @class DocumentJS.Add
 * @tag documentation
 * @parent DocumentJS.Type
 * Add docs to a class or construtor described in another file.
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
