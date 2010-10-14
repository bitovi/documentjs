// used to 'run' a documentjs/doc command:

(function(){
	
	
	var basePath = java.lang.System.getProperty("basepath"),
		cmd = java.lang.System.getProperty("cmd"),
		file = _args[0],
		oldLoad = load,
		oldReadFile = readFile, 
		output;
		
	if(_args[1] == "-o"){
		output = _args[2];
	}
	
	load = function( path ) {
		if (!/^\/\//.test(path) && !/^\w\:\\/.test(path)) {
			path = basePath + "../" + path
		}
		oldLoad(path)
	}
	readFile = function( path ) {
		if (!/^\/\//.test(path) && !/^\w\:\\/.test(path)) {
			path = basePath + "../" + path
		}
		return oldReadFile(path)
	}
	load('steal/rhino/steal.js');
	
	var doc = function(total, outputDir){
		//now that we have all the scripts ... get stuff we need
		steal.overwrite = true
		load('documentjs/documentjs.js');
		
		var app = new DocumentJS.Application(total, "documentjs/test");
		app.generate(output || outputDir, "docs")
	}
	
	// determine how to handle
	var total = [];
	if (/\.html$/.test(file)) { // load all the page's scripts
		steal.plugins('steal/build', function(steal){
			
			steal.build.open(_args[0]).each(function(script, text, i){
				if (text && script.src) {
					total.push({
						src: text,
						path: script.src
					})
				}
			});
			doc(total, file.replace(/[^\/]*$/, 'docs'))
		});
	}
	else if (/\.js$/.test(file)) { // load just this file
		total.push({
			src: readFile(file),
			path: file
		})
		doc(total, file.replace(/[^\/]*$/, 'docs'))
	}
	else { // assume its a directory
		var jsFiles = [];
		function addJS(fil) {
			var path = fil.getPath().replace('\\', '/');
			if (path.match(/\.js$/)){
				jsFiles.push(path);
			}
		}
		function getJSFiles(dir, dirHandler) {
			var lst = new java.io.File(dir).listFiles(), i;
			for(i=0;i<lst.length;i++) {
				if(lst[i].isDirectory()) {
					getJSFiles(lst[i].getPath(), dirHandler);
				}
				dirHandler(lst[i]);
			}
		}
		getJSFiles(file, addJS);
		for (var i = 0; i < jsFiles.length; i++){
			total.push({
				src: readFile(jsFiles[i]),
				path: ''+jsFiles[i]
			})
		}
		doc(total, file+'/docs')
	}
	
	
})()

