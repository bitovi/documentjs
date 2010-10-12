var basePath = java.lang.System.getProperty("basepath"),
	cmd = java.lang.System.getProperty("cmd"),
	file = _args[0],
	oldLoad = load,
	oldReadFile = readFile;

load = function( path ) {
	oldLoad(basePath + "../" + path)
}
readFile = function( path ) {
	if (!/^\/\//.test(path)) {
		path = basePath + "../" + path
	}
	return oldReadFile(path)
}
load('steal/rhino/steal.js');
steal.plugins('steal/build', function( steal ) {
	var total = [];

	steal.build.open(_args[0]).each(function( script, text, i ) {
		if ( text && script.src ) {
			total.push({
				src: text,
				path: script.src
			})
		}
	});

	//now that we have all the scripts ... get stuff we need
	steal.overwrite = true
	load('documentjs/documentjs.js');

	var app = new DocumentJS.Application(total, "documentjs/test");
	app.generate(_args[0].replace(/[^\/]*$/, "docs"))

});