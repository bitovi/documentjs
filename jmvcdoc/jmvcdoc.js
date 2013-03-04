steal.loadedProductionCSS = true;
steal(
	'documentjs/jmvcdoc/navigation',
	'./style.less','./update.less',
	'can/util/string',
	'can/view/modifiers',
	'can/view/ejs',
    'documentjs/jmvcdoc/models/search.js',
	'documentjs/jmvcdoc/content',
	'documentjs/jmvcdoc/nav',
	'documentjs/jmvcdoc/search',
	'can/route',
	'steal/html',
	function (Navigation) {
	var pageNameArr = window.location.href.match(/docs\/(.*)\.html/),
		pageName = pageNameArr && pageNameArr[1];

	if (pageName && location.hash == "") {
		window.location.hash = "&who=" + pageName
	}
	can.route(":who", {who : window.DOCS_INDEX || "index"})("/search/:search");


	new Navigation('#nav');
	new Jmvcdoc.Content("#doc",{clientState : can.route.data});
	new Jmvcdoc.Search("#search");
});
