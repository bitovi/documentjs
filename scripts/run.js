// used to 'run' a documentjs/doc command:

(function(){
	//convert readFile and load
	
	(function(){
		var oldLoad = load,
			oldReadFile = readFile,
			basePath = java.lang.System.getProperty("basepath");
			
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
	})();
	load('steal/rhino/steal.js');
	
	load('documentjs/documentjs.js');
	
	var file = _args.shift(),
		options = steal.opts(_args || {}, {out: 1});

	DocumentJS(file,options);
	
	
})()

