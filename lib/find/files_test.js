var findFiles = require("./files");
var path = require("path");

var cwd = path.join(__dirname,"..","versions/test/tmp/0.0.1/example_project");

var fileEventEmitter = findFiles({
	pattern: "**/*.{js,md}",
	cwd: cwd
});

fileEventEmitter.on("match",function(src){

	console.log("FIND:",path.relative(process.cwd(),src));
	
	
});