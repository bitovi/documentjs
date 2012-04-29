steal('can/control','can/view/ejs','can/view/modifiers').then('./demo.ejs',function(){
	
/**
 * Handles the presentation of @demo tags by:
 * 
 *  - making the iframe url correct no matter where the page is
 *  - making the iframe hight correct
 *  - enabiling code highlighting
 */
can.Control('candoc.tags.Demo',
/* @Static */
{},
/* @Prototype */
{
	init: function() {
		var self = this,
			// default values
			height = 320,
			html = "",
			source = "",
			standbySource;


		this.element.html("//documentjs/jmvcdoc/demo/demo.ejs",{});

		var demoSrc = steal.root.join( this.element.attr("data-demo-src") ),
			$iframe = this.element.find("iframe");

		// when the iframe has loaded
		$iframe.one("load", function() {
			
			// get the body content
			var $body = $(this.contentWindow.document.body);

			// add some padding?
			self.find(".demo_content").css({
				"padding": "5px"
			});

			// get the HTML content
			html = this.contentWindow.DEMO_HTML || $body.find("#demo-html").html();
			
			// set and highlight the html content
			self.find(".html_content").html("<pre><code class=\"html\"></code></pre>").find("code").text($.trim(html)).highlight();
			
			// hide the instructions
			$body.find("#demo-instructions").hide();
			
			// get the source code
			source = $body.find("#demo-source").html();
			
			// set and highlight source code
			self.find(".source_content").html("<pre><code class=\"javascript\"></code></pre>").find("code").text($.trim(source)).highlight();

			// keep trying to find a height
			var run = function(){
				setTimeout(function() {
					height = $body.outerHeight();
					$iframe.height(height + 50);
					self.find(".demo_content").height(height + 55);
				}, 200)
			}
			if(this.contentWindow.jQuery){
				this.contentWindow.jQuery(run)
			} else {
				run()
			}
			

		})
		
		.attr("src", demoSrc);
	}
});
	
	
})
