steal('documentjs/libs/showdown.js',function(converter) {
	/**
	 * @constructor DocumentJS.tags.body @body
	 * @parent DocumentJS
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
	return  {
		add: function( line ) {
			
			var m = line.match(/^\s*@body\s*(.*)/)
			if ( m ) {
				this.comment = m[1]+" ";
				
			}
			return ["default","body"]
		},
		done: function(){
			if(this.body){
				this.body = converter.makeHtml(this.body)
			}
		}
	};
})