/**
 * @page mylib
 * @group grouping Grouping
 * Hello World
 */
//
/**
 * @page subpage
 * @parent mylib
 */
//
/**
 * @page sub-sub-page
 * @parent grouping
 */
//
/**
 * @constructor Foo
 * @parent mylib
 * @body
 * 
 *     //A Comment!
 */
function Foo(){};


/**
 * @prototype
 */
Foo.prototype = {
	/**
	 * @function Foo.prototype.bar bar
	 */
	bar: function(){
		
	}
};