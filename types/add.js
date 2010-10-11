steal.then(function(){
/**
 * @class DocumentJS.Type.types.add
 * @tag documentation
 * @parent DocumentJS.Type
 * Used to set scope to add to classes or methods in another file. 
 * 
 * ###Example:
 * 
 * @codestart
 *  /**
 *   * @add jQuery.Controller.prototype
 *   *|
 *   //breaker
 *  /**
 *   * Publishes a message to OpenAjax.hub.
 *   * @param {String} message Message name, ex: "Something.Happened".
 *   * @param {Object} data The data sent.
 *   *|
 *   jQuery.Controller.prototype.publish = function() {
 *      OpenAjax.hub.publish.apply(OpenAjax.hub, arguments);
 *   }
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
})