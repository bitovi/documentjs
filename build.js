// First Move JMVC Doc Here:

load('jmvcdoc/scripts/build.js');
new steal.File("jmvcdoc/production.js").copyTo("documentjs/jmvcdoc/production.js");
new steal.File("jmvcdoc/style.css").copyTo("documentjs/jmvcdoc/style.css");
new steal.File("jmvcdoc/summary.ejs").copyTo("documentjs/jmvcdoc/summary.ejs");

new steal.File("jmvcdoc/images").copyTo("documentjs/jmvcdoc/images");

// now pluginify, and move everything to work
load('steal/rhino/steal.js');

steal('//steal/build/pluginify', function( s ) {
	steal.pluginify("documentjs", {
		destination: "documentjs/dist/documentjs/documentjs.js",
		nojquery: "steal"
	});
});

// copy files
new steal.File("documentjs/scripts/run.js").copyTo("documentjs/dist/documentjs/scripts/run.js");
new steal.File("documentjs/doc.bat").copyTo("documentjs/dist/documentjs/doc.bat");
new steal.File("documentjs/jmvcdoc/summary.ejs").copyTo("documentjs/dist/documentjs/jmvcdoc/summary.ejs");
new steal.File("steal/build/build.js").copyTo("documentjs/dist/steal/build/build.js");
new steal.File("steal/rhino/env.js").copyTo("documentjs/dist/steal/rhino/env.js");
new steal.File("steal/rhino/file.js").copyTo("documentjs/dist/steal/rhino/file.js");
new steal.File("steal/rhino/js.jar").copyTo("documentjs/dist/steal/rhino/js.jar");
new steal.File("steal/rhino/loader.bat").copyTo("documentjs/dist/steal/rhino/loader.bat");
new steal.File("steal/rhino/steal.js").copyTo("documentjs/dist/steal/rhino/steal.js");
new steal.File("steal/steal.production.js").copyTo("documentjs/dist/steal/steal.production.js");

// copy jmvcdoc stuff
new steal.File("jmvcdoc/production.js").copyTo("documentjs/dist/documentjs/jmvcdoc/production.js");
new steal.File("jmvcdoc/style.css").copyTo("documentjs/dist/documentjs/jmvcdoc/style.css");

new steal.File("jmvcdoc/images").copyTo("documentjs/dist/documentjs/jmvcdoc/images");