steal.then(function() {
	/**
	 * @class DocumentJS.Tags.download
	 * @tag documentation
	 * @parent DocumentJS.Tags 
	 * 
	 * Adds a download link.
	 * 
	 * ###Example:
	 * 
	 * @codestart
	 * /**
	 *  * @constructor jQuery.Drag
	 *  * @parent specialevents
	 *  * @plugin jquery/event/drag
	 *  * @download jquery/dist/jquery.event.drag.js
	 *  * @test jquery/event/drag/qunit.html
	 * @codeend
	 * 
	 * ###End Result:
	 * 
	 * @image jmvc/images/download_tag_example.png 970
	 */
	DocumentJS.Tags.download = {
		add: function( line ) {
			var parts = line.match(/^\s*@download\s*([^ ]*)\s*([\w]*)/)
			this.download = parts[1];
			this.downloadSize = parts[2] || 0
		}
	};
})