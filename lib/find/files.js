var glob = require("glob"),
	_ = require("underscore");

module.exports = function(options){
	var pattern;
	var globOptions;
	
	if(typeof options.glob === "string"){
		var pattern = options.glob;
		globOptions = {};
	} else {
		pattern = options.glob.pattern;
		globOptions = _.extend({}, options.glob);
		delete globOptions.pattern;
	}
	var glb = new glob.Glob(pattern, globOptions);
	
	return glb;
};