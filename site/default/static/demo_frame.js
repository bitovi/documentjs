steal("can/control","./demo_frame.mustache","jquery","can/observe","./prettify.js",function(Control,demoFrameMustache,$){
	
	

return can.Control({
	init: function() {
		// Render out the demo container.
		this.element.html(demoFrameMustache( {demoSrc: '../' + this.element.data('demoSrc')}));

		// Start with the demo tab showing.
		this.showTab('html');

		// When the iframe loads, grab the HTML and JS and fill in the other tabs.
		var self = this;
		$('[data-for=demo] > iframe').load(function() {
			var demoEl = this.contentDocument.getElementById('demo-html'),
				sourceEl = this.contentDocument.getElementById('demo-source')

			var html = demoEl ? demoEl.innerHTML : this.contentWindow.DEMO_HTML;
			
			if(!html) {
				// try to make from body
				var clonedBody = $(this.contentDocument.body).clone();
				clonedBody.find("script").remove();
				html = $.trim( clonedBody.html() );
			}

			var source = sourceEl ? sourceEl.innerHTML : this.contentWindow.DEMO_SOURCE;
			if(!source){
				source =  $(this.contentDocument.body).find("script:not([src])")[0].innerHTML
			}

			$('[data-for=html] > pre').html(self.prettify(html));
			$('[data-for=js] > pre').html(self.prettify( source ));
			//prettyPrint();
		});
	},
	'.tab click': function(el, ev) {
		this.showTab(el.data('tab'));
	},
	showTab: function(tabName) {
		$('.tab', this.element).removeClass('active');
		$('.tab-content', this.element).hide();
		$('.tab[data-tab=' + tabName + ']', this.element).addClass('active');
		$('[data-for=' + tabName + ']', this.element).show();
	},
	prettify: function(unescaped) {
		return prettyPrintOne(unescaped.replace(/</g, '&lt;'));
	}
});

})