load('steal/rhino/steal.js')

steal('//steal/build/pluginify', function( s ) {
	steal.pluginify("documentjs", {
		destination: "documentjs/dist/documentjs/documentjs.js"
	})
})

// copy files
new steal.File("documentjs/jmvcdoc/summary.ejs").copyTo("documentjs/dist/documentjs/jmvcdoc/summary.ejs")
new steal.File("steal/build/build.js").copyTo("documentjs/dist/steal/build/build.js")
new steal.File("steal/rhino/env.js").copyTo("documentjs/dist/steal/rhino/env.js")
new steal.File("steal/rhino/file.js").copyTo("documentjs/dist/steal/rhino/file.js")
new steal.File("steal/rhino/js.jar").copyTo("documentjs/dist/steal/rhino/js.jar")
new steal.File("steal/rhino/loader.bat").copyTo("documentjs/dist/steal/rhino/loader.bat")
new steal.File("steal/rhino/steal.js").copyTo("documentjs/dist/steal/rhino/steal.js")