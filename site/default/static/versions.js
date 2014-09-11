steal("can/control", "can/util","jquery",function(Control, can, $){

	var pageConfig = window.pageConfig || {};

	return Control.extend({
		setup: function(el, options){
			el = $(el);
			var container = $("<select class='versions'/>").hide();
			el.after(container);
			return Control.prototype.setup.call(this, container, options);
		},
		init: function(){
			var self = this;
			
			$.ajax(pageConfig.docConfigDest || "../../documentjs.json", {
				success: function(docConfig){
					self.docConfig = docConfig;
					var versions = [];
					$.each(docConfig.versions||[], function(name){
						versions.push(name);
					});
					self.addOptions(versions);
				},
				error: function(){
					// self.addOptions(["0.0.0","0.0.1"]);	
				},
				dataType: "json"
			});
		},
		addOptions: function(versions){
			self.versions = versions;
			var html = "";
			can.each(versions, function(version){
				html += "<option value='"+version.number+"'"+
							(version == pageConfig.version ? 
								" SELECTED" : "") +
						">"+ version+
						"</option>";
			});
			this.element.html(html).fadeIn();
		},
		'change': function(el, ev) {
			var newVersion = this.element.val(),
				version = pageConfig.version,
				loc = ""+window.location,
				isVersioned = loc.indexOf("/"+version+"/") >= 0,
				versions = this.versions,
				isNewCurrentVersion = false,
				defaultVersion = this.docConfig.defaultVersion;
				
			for(var i =0 ; i < versions.length; i++){
			
				if(versions[i] == defaultVersion && versions[i] == newVersion){
					isNewCurrentVersion = true;
				} 
			}
	
			// All of this needs to use defaultDest and dest
	
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
	});

});

