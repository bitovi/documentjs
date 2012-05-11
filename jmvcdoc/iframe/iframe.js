steal('can/control',function(){

/**
 * @tag home
 * 
 * Handles iframe menu events
 */
can.Control('Iframe',
/* @Static */
{},
/* @Prototype */
{
	init: function() {
		var self = this;
		var height = 320,
			html = "",
			source = "";
		var scripts = [];

		this.element.append("<iframe></iframe>")
		//this.element.html("//documentjs/jmvcdoc/views/iframe/init.ejs", {});

		var src = steal.root.join(this.element.attr("data-iframe-src"));
		height = !this.element.attr("data-iframe-height") ? height : this.element.attr("data-iframe-height");
		var $iframe = this.element.find("iframe");
		$iframe.attr("src", src);
		$iframe.attr("height", height);

		$iframe.bind('load', function() {
			
		});
	}
});
})
