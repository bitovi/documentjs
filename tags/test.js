steal(function() {
	/**
	 * @constructor documentjs/tags/test @test
	 * @parent DocumentJS
	 * 
	 * Link to test cases.
	 * 
	 * #Example
	 * 
	 * @codestart
	 * /*
	 *  * @constructor jQuery.Drag
	 *  * @parent specialevents
	 *  * @plugin jquery/event/drag
	 *  * @download jquery/dist/jquery.event.drag.js
	 *  * @test jquery/event/drag/qunit.html
	 *  * ...
	 *  *|
	 *  $.Drag = function(){}
	 * @codeend
	 * 
	 * ###End Result:
	 * @image site/images/test_tag_example.png
	 * @image site/images/test_tag_test_example.png
	 */
	return {
		add: function( line ) {
			this.test = line.match(/@test ([^ ]+)/)[1];
		}
	};
})