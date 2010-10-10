/**
 * @class DocumentJS.Tags.image
 * @tag documentation
 * @parent DocumentJS.Tags 
 * 
 * Adds an image to some page, e.g. "@image documentjs/jmvcdoc/images/page_type_example.png 700".
 * 
 * ###Example:
 * 
 * @codestart
 * /* 
 *  * @image jmvcdoc/images/page_type_example.png 700
 *  *|
 * @codeend
 */
DocumentJS.Tags.image = {
    add: function(line){
        var m = line.match(/^\s*@image\s*([\w\.\/]*)\s*([\w]*)\s*(.*)/)
		
		if (m) {
			var src = m[1] ? m[1].toLowerCase() : '';
			var height = m[2] ? m[2] : '320';
			this.comment += "<div class='image_wrapper' "
			this.comment += "data-image-src='" + src + "' "
			this.comment += "data-image-height='" + height + "'></div>";
		}
    }
};