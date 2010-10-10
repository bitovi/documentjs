/**
 * @class DocumentJS.Type.types.page
 * @tag documentation
 * @parent DocumentJS.Type
 * 
 * Defines a standalone documentation page.
 * 
 * Can be used to build generic html content for your documentation site.
 */
DocumentJS.Type("page",{
	code : function(){
		
	},
	/*
	 * Possible scopes for @page.
	 */		
	parent : /script|page/,
	useName : false,
	hasChildren : true
})