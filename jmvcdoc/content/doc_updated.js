steal('jquery','documentjs/jmvcdoc/demo',function($){
	
	
	$(document).bind('docUpdated', function(ev, docData){
		var target = $(ev.target);
		
		// favorite link
		target.find("h1.addFavorite").
				append('&nbsp;<span class="favorite favorite' + (docData.isFavorite ? 'on' : 'off') + '">&nbsp;&nbsp;&nbsp;</span>');
		
		
		// scroll to the top
		
		
		// highlighting
		target.find("code").highlight();
		
		
		// API
		if ( $("#api").length ) {
			var names = [];
			for ( var name in Search._data.list ) {
				names.push(name)
			}
			$("#api").html(
			DocumentationHelpers.link("[" + names.sort(Search.sortJustStrings).join("]<br/>[") + "]", true))
		}


		// cleanup iframe menu when navigating to another page
		$(".iframe_menu_wrapper").remove();
		

		// hookup iframe ui
		//$(".iframe_wrapper").iframe();

		// hookup demo ui
		$(".demo_wrapper").demo();

		// add absolute paths to image tags
		$(".image_tag").each(function() {
			var imageTagEl = $(this),
				relativePath = imageTagEl.attr("src"),
				absolutePath = steal.root.join(relativePath);
			imageTagEl.attr("src", absolutePath);
		});
		
		// add disqus comments
		// $("#disqus_thread").children().remove();
		// if ( docData.name != "index" && typeof(COMMENTS_LOCATION) != "undefined" && $("#disqus_thread").length ) {
			// window.disqus_title = docData.name;
			// window.disqus_url = "http://" + location.host + "/docs/" + docData.name + ".html";
			// window.disqus_identifier = docData.name;
			// steal.insertHead(COMMENTS_LOCATION);
		// }
		
	})
	
	
})
