/**
 * @class DocumentJS.Type.types.page
 * @tag documentation
 * @parent DocumentJS.Type
 * 
 * Defines a standalone documentation page.
 * 
 * Can be used to build generic html content for your documentation site.
 * 
 * ###Example:
 * 
 * @codestart
 * /**
 *  * @page follow Follow JavaScriptMVC
 *  * &lt;h1 class='addFavorite'&gt;Following JavaScriptMVC&lt;/h1&gt;
 *  * &lt;h2&gt;Twitter&lt;/h1&gt;
 *  * &lt;a href='http://twitter.com/javascriptmvc' class='floatLeft'&gt;
 *  *     &lt;img src='http://wiki.javascriptmvc.com/wiki/images/f/f7/Twitter.png' class='noborder'/&gt;
 *  * &lt;/a&gt;
 *  *
 *  * Follow [http://twitter.com/javascriptmvc @javascriptmvc] on twitter for daily useful tips.
 *  * &lt;h2 class='spaced'&gt;Blog</h2&gt;
 *  * &lt;a href='http://jupiterit.com/' class='floatLeft'&gt;
 *  *     &lt;img src='http://wiki.javascriptmvc.com/wiki/images/e/e5/Blog.png' class='noborder'/&gt;
 *  * &lt;a&gt;
 *  *
 *  * Read [http://jupiterit.com/ JavaScriptMVC's Blog] for articles, techniques and ideas
 *  * on maintainable JavaScript.
 *  * &lt;h2 class='spaced'&gt;Email List</h2&gt;
 *  * &lt;a href='http://forum.javascriptmvc.com/' class='floatLeft'&gt;
 *  *     &lt;img src='http://wiki.javascriptmvc.com/wiki/images/8/84/Discuss.png' class='noborder'/&gt;
 *  * &lt;/a&gt;
 *  * Discuss ideas to make the framework better or problems you are having on  [http://forum.javascriptmvc.com/ JavaScriptMVC's Forum] 
 * .*
 *  *|
 * @codeend
 * 
 * ###End Result:
 * 
 * @image documentjs/jmvcdoc/images/page_type_example.png 420
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