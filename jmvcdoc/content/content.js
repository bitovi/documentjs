steal('can/construct/proxy',
	'can/control',
	'can/observe/delegate',
	'can/view/ejs',
	'documentjs/jmvcdoc/highlight',
	
	'documentjs/jmvcdoc/resources/helpers.js',
	'documentjs/jmvcdoc/models/search.js'
	).then(

	'./views/attribute.ejs',
	'./views/class.ejs',
	'./views/constructor.ejs',
	'./views/favorite.ejs',
	'./views/function.ejs',
	'./views/page.ejs', 
	'./views/results.ejs', 
	'./views/top.ejs', 
	'./helpers/helpers.js',
		function(){

/**
 * @class Jmvcdoc.Content
 */
can.Control('Jmvcdoc.Content',
/* @Static */
{
	defaults : {
	
	}
},
/* @Prototype */
{
	init : function(){
		for(var name in candoc.content.helpers){
			new candoc.content.helpers[name](this.element)
		}
	},
	"{clientState} who set" : function(clientState, ev, val){
		this._currentPage = val;
		// write out who this is
		this.element.html("Loading ...")
			.scrollTop(0);
		Doc.findOne({
			name: val
		}, $.proxy(function(docData){
			if(Doc.dataDeferred.state() === 'resolved'){
				this.show(docData)
			} else {
				Doc.dataDeferred.then(this.proxy('show',docData))
			}
		}, this), function() {
			can.route.attr({ who : window.DOCS_INDEX ||'index' });
		});
	},
	show : function(docData) {
		document.title = docData.title || docData.name.replace(/~/g,".");
		this.element.html("//documentjs/jmvcdoc/content/views/article.ejs", docData, DocumentationHelpers)
			.trigger("docUpdated",[docData]);
		
		// generate contents
		this.element.find("h2").each(function(){
			$("<li>").html(can.route.link($(this).text(), {where: $(this).text()})).appendTo("#outline")
		})
		
		
		
		if(window._gaq){
			window._gaq.push(['_trackPageview', document.title]);
		}
	},
	"{clientState} where": function(cs,ev, newVal){
		if(newVal){
			$('html, body').animate({
	         scrollTop: $("h2:contains("+newVal+")").offset().top
	     	}, 200);
		}
		
	}
});

});