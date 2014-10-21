var converter = require('../stmd_to_html'),
	startHTMLComment = /\s*<!--/,
	endHTMLComment = /\s*-->/;
/**
 * @constructor documentjs.tags.body @body
 * @parent documentjs.tags
 * 
 * @description 
 * 
 * Content after the `@body` tag appears after 
 * the title and signature content.
 * 
 * @signature `@body`
 * 
 * @codestart
 * /**
 *  * A component for lib.
 *  * @param {String} name
 *  * 
 *  * @body
 *  * 
 *  * ## Creating a lib.Component
 *  *
 *  *     new lib.Component("name")
 *  *|
 * lib.Component = function(name){}
 * @codeend
 * 
 * 
 * 
 */
module.exports= {
	add: function( line ) {
		
		var m = line.match(/^\s*@body\s*(.*)/);
		if ( m ) {
			this.comment = m[1]+" ";
			
		}
		return ["default","body"];
	},
	done: function(){
		if(this.body){
			// clean up <!-- comments around params
			if( startHTMLComment.test(this.description) && endHTMLComment.test(this.body) ) {
				this.description = this.description.replace(startHTMLComment,"");
				this.body = this.body.replace(endHTMLComment,"");
			}
			
			this.body = converter(this.body);
		}
	}
};
