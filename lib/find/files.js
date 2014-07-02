var glob = require("glob");

module.exports = function(pattern, options){
	return new glob.Glob(pattern, {});
};