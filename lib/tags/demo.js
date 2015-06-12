/**
 * @constructor documentjs.tags.demo @demo
 * @parent documentjs.tags
 *
 * @description Placeholder for an application demo.
 *
 * @signature `@demo SRC [HEIGHT] [JSBIN]`
 *
 * @codestart javascript
 * /**
 *  * @demo can/control/control.html 300 +jsbin
 *  *|
 * @codeend
 *
 * @param {String} SRC The source of the html page.
 * @param {Number} [HEIGHT] The height of the html page. If
 * a height is not provided, the height is determined as
 * the content of the body.
 * @param {String} [JSBIN] A flag to display a link that
 * will load the demo code in [JS Bin](jsbin.com); by default
 * the link will not be shown. You can pass the flag (`+jsbin`)
 * as the second argument if [HEIGHT] is not provided, e.g:
 *
 * 	@codestart javascript
 * 	/**
 * 	 * @demo can/control/control.html +jsbin
 * 	 *|
 * 	@codeend
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
module.exports = {
	add: function(  line, curData, scope, objects, currentWrite ) {
		var jsbinFlag = '+jsbin';
		var matches = line.match(/^\s*@demo\s*([\w\.\/\-\$]*)\s*([\w]*)\s*(\+jsbin)*/);

		// signatures to support
		// @demo path/to/demo
		// @demo path/to/demo 400
		// @demo path/to/demo +jsbin
		// @demo path/to/demo 400 +jsbin
		if (matches) {
			var src = matches[1] ? matches[1].toLowerCase() : '';
			var height = Number(matches[2]) > 0 ? matches[2] : 0;
			var includeJsbinLink = matches[2] === jsbinFlag || matches[3] === jsbinFlag;

			var htmlStart = '<div class="demo_wrapper"';
			var htmlEnd = '></div>\n';

			if (src) {
				htmlStart += ' data-demo-src="' + src + '"';
			}

			if (height) {
				htmlStart += ' data-demo-height="' + height + '"';
			}

			if (includeJsbinLink) {
				htmlStart += ' data-jsbin-link="true"';
			}

			var cd = (curData && curData.length !== 2);
			var cw = (currentWrite || "body");
			var html = htmlStart + htmlEnd;

			// use curData if it is not an array
			var useCurData = cd && (typeof curData.description === "string") && !curData.body;

			if (useCurData) {
				curData.description += html;
			}
			else {
				this.body += html;
			}
		}
	}
};
