steal("can/control", "can/util","jquery",function(Control, can, $){

	var versionsDest = "../documentjs/documentjs.json";
	var version = "1.2.3";

	return Control.extend({
		init: function(){

		}
	});

});
/*
can.Control.extend('Bitovi.OSS.Versions', {}, {
	'init': function( element ) {
		var self = this;
		$.get(docConfig.versionsSrc,{}, function(versions){
			self.versions = versions;
			var html = "";
			can.each(versions, function(version){
				html += "<option value='"+version.number+"'"+
							(version.number == docConfig.version ? 
								" SELECTED" : "") +
						">CanJS v"+ version.number+"" +(version.branch && version.branch != "master" ? "-pre": "") +
						"</option>";
			});
			element.html(html);
			
		},"json")
	},
	'change': function(el, ev) {
		var newVersion = this.element.val(),
			version = docConfig.version,
			loc = ""+window.location,
			isVersioned = loc.indexOf("/"+version+"/") >= 0,
			versions = this.versions,
			isNewCurrentVersion = false
			
		for(var i =0 ; i < versions.length; i++){
		
			if(versions[i].branch == "master" && versions[i].number == newVersion){
				isNewCurrentVersion = true;
			} 
		}

		// going old to new
		if( isVersioned && isNewCurrentVersion )  {
			window.location = loc.replace("/"+version+"/","/");
			
		// going new to old
		} else if( !isVersioned ) {
			if ( loc.indexOf("/docs/") >= 0 ) {
				window.location = loc.replace("/docs/","/"+newVersion+"/docs/");
			} else {
				window.location = loc.replace("/guides/","/"+newVersion+"/guides/");
			}
		} else {
			// going old to old
			
			window.location = loc.replace("/"+version+"/","/"+newVersion+"/");
		}
		
	}
});*/
