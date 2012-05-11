steal.loadedProductionCSS = true;
steal('can/util/string',
	'can/control/plugin',
	'can/view/modifiers',
	'can/view/ejs',
    'documentjs/jmvcdoc/models/search.js',
	'documentjs/jmvcdoc/content',
	'documentjs/jmvcdoc/nav',
	'documentjs/jmvcdoc/search',
	'can/route',
	'steal/html',
	'steal/less',
	'./resources/helpers.js'
	).then('./style.less',function() {

	can.extend(can.EJS.Helpers.prototype, DocumentationHelpers);
	var pageNameArr = window.location.href.match(/docs\/(.*)\.html/),
		pageName = pageNameArr && pageNameArr[1];
		
		if ( pageName && location.hash == "" ) {
			window.location.hash = "&who=" + pageName
		}
	can.route(":who",{who: "index"})("/search/:search");
	
		
	$('#nav').jmvcdoc_nav();
	$("#doc").jmvcdoc_content({clientState : can.route.data});
	$("#search").jmvcdoc_search({clientState : can.route.data});
})
