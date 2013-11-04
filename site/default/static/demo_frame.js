steal("can/control","./demo_frame.mustache","jquery","can/observe","./prettify.js",function(Control,demoFrameMustache,$){
	
	

return can.Control({
	init: function() {
		// Render out the demo container.
		this.element.html(demoFrameMustache( {demoSrc: '../' + this.element.data('demoSrc'), jsfiddle: !!window.Bitovi.JSFIDDLE }));

		// Start with the demo tab showing.
		this.showTab('demo');

		// When the iframe loads, grab the HTML and JS and fill in the other tabs.
		var self = this;
		var iFrame = this.element.find("iframe");
		iFrame.load(function() {
			var demoEl = this.contentDocument.getElementById('demo-html'),
				sourceEl = this.contentDocument.getElementById('demo-source')

			self.demoBody = $(this.contentDocument.body).clone();
			self.demoHead = $(this.contentDocument.head).clone();

			var html = demoEl ? demoEl.innerHTML : this.contentWindow.DEMO_HTML;
			
			if(!html) {
				// try to make from body
				var clonedBody = $(this.contentDocument.body).clone();
				clonedBody.find("script").each(function(){
					if(!this.type || this.type.indexOf("javascript") >= 0){
						$(this).remove()
					}
				});
				clonedBody.find("style").remove();
				html = $.trim( clonedBody.html() );
			}

			var source = sourceEl ? sourceEl.innerHTML : this.contentWindow.DEMO_SOURCE;
			if(!source){
				var scripts = $(this.contentDocument.body).find("script:not([src])");
				// get the first one that is JS
				for(var i =0; i < scripts.length; i++){
					if(!scripts[i].type || scripts[i].type.indexOf("javascript") >= 0){
						source =  scripts[i].innerHTML
					}
				}
				
			}
			source = $.trim(source);

			self.element.find('[data-for=html] > pre').html(self.prettify(html));
			self.element.find('[data-for=js] > pre').html(self.prettify( source.replace(/\t/g,"  ") ));

			//prettyPrint();
	
			var resizeIframe = function(){
				iFrame.height(0);
				iFrame.height($(iFrame).contents().height());
				setTimeout( arguments.callee, 1000 )
			}
			
			resizeIframe()
			
			
			
		});
	},
	'.tab click': function(el, ev) {
		var tab = el.data('tab');
		if(tab === 'jsfiddle') {
			if(!this.fiddleData) {
				this.fiddleData = this.scrapeForFiddle(this.demoHead, this.demoBody);

			  this.element.find('input[name=resources]').val(this.fiddleData.resources.join(','));
			  this.element.find('input[name=html]').val(this.fiddleData.html.join(' '));
			  this.element.find('input[name=css]').val(this.fiddleData.styles.join(' '));
			  this.element.find('input[name=js]').val(this.fiddleData.scripts.join(' '));	
			}

		  this.element.find('form').submit();
		}
		else {
			this.showTab(el.data('tab'));	
		}
		
	},
	showTab: function(tabName) {
		$('.tab', this.element).removeClass('active');
		$('.tab-content', this.element).hide();
		$('.tab[data-tab=' + tabName + ']', this.element).addClass('active');
		$('[data-for=' + tabName + ']', this.element).show();
	},
	prettify: function(unescaped) {
		return prettyPrintOne(unescaped.replace(/</g, '&lt;'));
	},
	scrapeForFiddle: function(head, body) {
	  var resources = [];
	    scripts = [],
	    styles = [],
	    html = [],
		stripScriptStyle = function(elem) {
	    // Grab styles
	    elem.find('style').each(function(i, style) {
	    	styles.push(style.textContent);
	    }).remove();

	    // Grab link resources
	    elem.find('link').each(function(i, link) {
	    	resources.push(link.href);
	    }).remove();

	    // Grab script resources
	    elem.find('script[src]').each(function(i, script) {
	    	resources.push(script.src);
	    }).remove();

	    // Grab inline JavaScript
	    elem.find("script:not([src]):not([type$=mustache]:not([type$=ejs]))").each(function(i, script) {
	    	scripts.push(script.text);
	    }).remove();

		};

		stripScriptStyle(head);
		stripScriptStyle(body);

    html.push(body.html());

    return {
    	resources: resources,
    	scripts: scripts,
    	styles: styles,
    	html: html
    };
	}
});

})