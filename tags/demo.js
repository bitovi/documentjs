steal(function() {
	/**
	 * @constructor DocumentJS.tags.demo @demo
	 * @parent DocumentJS 
	 * 
	 * @description Placeholder for an application demo.
	 * 
	 * @signature `@demo SRC [HEIGHT]`
	 * 
	 * @codestart
	 * /**
	 *  * @demo can/control/control.html 300
	 *  *|
	 * @codeend
	 * 
	 * @param {String} SRC The source of the html page.
	 * @param {Number} [HEIGHT] The height of the html page. If
	 * a height is not provided, the height is determined as
	 * the content of the body.
	 * 
	 * @body
	 * 
	 * ## Specifying the HTML and JS source
	 * 
	 * By default, `@demo` uses the html of the body minus
	 * any script tags as the HTML source. This can 
	 * be changed by:
	 * 
	 *  - Adding an element with `id="demo-html"` or 
	 *    setting `window.DEMO_HTML` to the source text.
	 *  - Adding `id="demo-source"` to a script tag or
	 *    setting `window.DEMO_SOURCE` to the source JS.
	 */
	return {
		add: function( line ) {
			var m = line.match(/^\s*@demo\s*([\w\.\/\-\$]*)\s*([\w]*)/)
			if ( m ) {
				var src = m[1] ? m[1].toLowerCase() : '';
				var heightAttr = m[2].length > 0 ? " data-demo-height='" + m[2] + "'" : '';
				this.body += "<div class='demo_wrapper' data-demo-src='" + src + "'" + heightAttr + "></div>";
			}
		}
	};
})