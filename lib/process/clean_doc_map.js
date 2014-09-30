var addChildren = require("./add_children"),
	docMapInfo = require("./doc_map_info"),
	_ = require("lodash");

module.exports = function(docMap, options){
	
	if(!options.parent) {
		var info = docMapInfo(docMap);
		
		if(_.size(info.nameHeightMap) === 1) {
			// everything is under one object, so use that
			options.parent = info.maxName;
			
		} else if( _.size(info.parentHeightMap) === 1 ) {
			// everything is under one object that doesn't exist, so create it
			docMap[info.maxParent] = {
				name: maxParent,
				body: "This is temporary content.  Create a "+maxParent+" @page.",
				type: "page"
			};
			options.parent = info.maxParent;
		} else {
			// we need to balance an empty project, which should probably have everything
			// just added to it
			// with an older project which should have "parent" added
			var maxParent = info.maxParent || "index";
			docMap[maxParent] = {
				name: maxParent,
				body: "This is temporary content.  Create an "+(maxParent)+
				" @page or specify <code>parent</code> in your siteConfig.",
				type: "page"
			};
			_.forEach(info.nameHeightMap, function(val, name){
				docMap[name].parent = maxParent;
			});
			
			options.parent = maxParent;
			
		}
		
		console.warn("Guessed parent '"+options.parent+"'. Set parent in your siteConfig.");
	}
	
	addChildren(docMap);
	
	// Check that parent is in docMap
	if(!docMap[options.parent]){
		throw "The parent DocObject ("+options.parent+") was not found!";
	}
	
};
