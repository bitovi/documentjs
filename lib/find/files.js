var glob = require("glob");

module.exports = function(options){
	var pattern;
	if(typeof options === "string"){
		var pattern = options;
		options = {};
	} else {
		pattern = options.pattern;
		delete options.pattern;
	}
	var glb = new glob.Glob(pattern, options);
	
	return glb;
};