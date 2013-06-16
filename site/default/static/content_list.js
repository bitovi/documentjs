steal("can/control","./content_list.mustache","jquery","can/observe",function(Control, contentList, $){

	return can.Control({
		init: function() {
			var sections = [];
	
			this.collectSignatures().each(function(ix) {
				var h2 = $('h2', this);
				this.id = 'sig_' + h2.text().replace(/\s/g,"").replace(/[^\w]/g,"_");
				//this.id = encodeURIComponent(h2.text());
				sections.push({id: this.id, text: h2.text()});
			});
	
			this.collectHeadings().each(function(ix) {
				var el = $(this);
				this.id = 'section_' + el.text().replace(/\s/g,"").replace(/[^\w]/g,"_");
				//this.id = encodeURIComponent(el.text());
				sections.push({id: this.id, text: el.text()});
			});
	
			this.element.html(contentList(
				{sections: sections},
				{encode: function() { return encodeURIComponent(this); }}
			));
	
			if(window.location.hash.length) {
				var anchor = $(window.location.hash);
				if(anchor.length) {
					anchor[0].scrollIntoView(true);
				}
			}
		},
		collectSignatures: function() {
			return $('.content .signature');
		},
		collectHeadings: function() {
			return $('.content .comment h2');
		}
	});

})