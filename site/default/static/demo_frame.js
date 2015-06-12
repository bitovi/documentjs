steal(
	"can/control",
	"./demo_frame.mustache!",
	"jquery",
	"can/observe",
	"./prettify.js",
	function(Control, demoFrameMustache, $){

		var jsbinBaseUrl = "http://jsbin.com/?html,js,output";

		return can.Control.extend({
			init: function(element, options) {
				var docConfig = window.docConfig || {};
				var demoSrcRoot = docConfig.demoSrcRoot || "..";
				var demoSrc = demoSrcRoot + "/" + options.demoSrc;

				// Render out the demo container.
				this.element.html(demoFrameMustache({ demoSrc: demoSrc }));

				// Start with the demo tab showing.
				this.showTab("demo");

				// When the iframe loads, grab the HTML and JS and fill in the other tabs.
				var self = this;
				var iFrame = this.element.find("iframe");

				// set the iframe height if provided.
				if (options.demoHeight) {
					iFrame.height(options.demoHeight);
				}

				iFrame.load(function() {
					var clonedBody;
					var demoEl = this.contentDocument.getElementById("demo-html");
					var	sourceEl = this.contentDocument.getElementById("demo-source");
					var html = demoEl ? demoEl.innerHTML : this.contentWindow.DEMO_HTML;

					if(!html) {
						// try to make from body
						clonedBody = $(this.contentDocument.body).clone();
						clonedBody.find("script").each(function(){
							if(!this.type || this.type.indexOf("javascript") >= 0){
								$(this).remove();
							}
						});
						clonedBody.find("style").remove();
						html = $.trim( clonedBody.html() );
					}

					var prettyHtml = self.prettify(html);
					self.element.find("[data-for=html] > pre").html(prettyHtml);

					var source = sourceEl ? sourceEl.innerHTML : this.contentWindow.DEMO_SOURCE;
					if(!source){
						var scripts = $(this.contentDocument.body).find("script:not([src])");
						// get the first one that is JS
						for(var i = 0, len = scripts.length; i < len ; i++){
							if(!scripts[i].type || scripts[i].type.indexOf("javascript") >= 0){
								source =  scripts[i].innerHTML;
							}
						}
					}

					source = $.trim(source);
					var prettySource = self.prettify(source.replace(/\t/g,"  "));
					if(prettySource.length) {
						self.element.find("[data-for=js] > pre").html(prettySource);
						self.element.find("[data-tab=js]").show();
					}

					if (options.includeJsbinLink) {
						clonedBody = $(this.contentDocument.body).clone();
						self.appendJsbinLink(clonedBody, source);
					}

					var resizeIframe = function(){
						// The following was called to make it possible to shrink the size of the demo.
						// This feature was removed because it broke the tooltip demo on can.view.attr's page
						// iFrame.height(0);
						iFrame.height($(iFrame).contents().height());
						setTimeout( arguments.callee, 1000 );
					};

					resizeIframe();
				});
			},
			".tab click": function(el, ev) {
				this.showTab(el.data("tab"));
			},
			showTab: function(tabName) {
				this.element
					.find(".tab").removeClass("active").end()
					.find(".tab-content").hide().end()
					.find(".tab[data-tab=" + tabName + "]").addClass("active").end()
					.find("[data-for=" + tabName + "]").show();
			},
			prettify: function(unescaped) {
				return prettyPrintOne(unescaped.replace(/</g, "&lt;"));
			},
			appendJsbinLink: function(body, source) {
				// from https://github.com/sindresorhus/is-absolute-url
				var isAbsoluteUrl = function(url) {
					return /^(?:\w+:)?\/\//.test(url);
				};

				var relativeToAbsolute = function(relPath) {
					var element = document.createElement("span");
					element.innerHTML = '<a href="' + relPath + '">&nbsp;</a>';
					return element.firstChild.href;
				};

				var checkUrlInAttr = function(attr) {
					return function() {
						var $el = $(this);
						var val = $el.attr(attr);

						if (!isAbsoluteUrl(val)) {
							$el.attr(attr, relativeToAbsolute(val));
						}
					};
				};

				// remove from the body any script tag that might contain JS
				// code and transforms relative urls to absolute urls.
				body.find("style").remove().end()
					.find("#demo-source").remove().end()
					.find("script").not("[type]").not("[src]").remove().end()
					.find("script[type*='javascript']").remove().end()
					.find("[src]").each(checkUrlInAttr("src")).end()
					.find("[href]").each(checkUrlInAttr("href"));

				var sanitizedHtml = $.trim(body.html());

				this.element.find(".jsbin_link_wrapper").html($("<a>", {
					target: "_blank",
					html: '<i class="icon-breakout"></i>Open in JS Bin',
					href: jsbinBaseUrl + "&" + $.param({
						js: source,
						html: "<body>" + sanitizedHtml + "</body>"
					})
				}));
			}
		});
	}
);
