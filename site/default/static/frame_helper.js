var $ = require("jquery");
var CanControl = require("can-control");
var DemoFrame = require("./demo_frame");

module.exports = CanControl.extend({
	init: function() {
		this.$element = $(this.element);
		this.replaceIframes();
		this.replaceDemos();
	},
	replaceIframes: function() {
		// @iframe can/test/demo.html 400
		// <div class="iframe_wrapper" data-iframe-src="can/test/demo.html" data-iframe-height="400"></div>
		$('.iframe_wrapper', this.$element).each(function() {
			var wrapper = $(this),
				iframe = $('<iframe src="../' + wrapper.data('iframeSrc') + '">');
			
			if(wrapper.data('iframeHeight')) {
				iframe.height(wrapper.data('iframeHeight'));
			}

			wrapper.append(iframe);
		});
	},
	replaceDemos: function() {
		// @demo can/control/control.html 400
		// <div class="demo_wrapper" data-demo-src="can/control/control.html"></div>
		$('.demo_wrapper', this.$element).each(function() {
			new DemoFrame(this);
		});
	}
});
