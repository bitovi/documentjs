
module.exports = {
	
	generate: require("./lib/generate/generate"),
	find: require("./lib/find/find"),
	generators: {
		html : require("./lib/generators/html/html")
	},
	process: require("./lib/process/process"),
	tag: require("./lib/tags/tags")
};