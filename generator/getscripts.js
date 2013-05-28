steal('documentjs/types/script.js', 'steal/build', 'steal/rhino/json.js',
	  function(Script) {

	var helpers = {
		files : function(path, cb){
			var getJSFiles = function(dir){
			  var file = new steal.URI(dir);
			  if(file.isFile()) {
				  cb(dir.replace('\\', '/'), dir);
			  } else {
				  file.contents(function(f, type){
					if(type == 'directory' && !/node_modules/.test(f)) {
				       getJSFiles(dir+"/"+f)
				    }else {
					  cb((dir+"/"+f).replace('\\', '/'), f);
				    }
				  });
			  }
			};
			getJSFiles(path);
		},
		getScripts : function(file){
			var collection = [], scriptUrl;
			if (/\.html?$/.test(file)) { // load all the page's scripts
				steal.build.open(file, function(scripts){
					var paths = steal.config().paths;
					scripts.each(function(script, text){
						if(script.id && text){
							scriptUrl = paths[script.id] || script.id;
							collection.push({
								src: scriptUrl,
								text: script.text
							})
						}
					});
				});
			}
			else if (/\.js$/.test(file)) { // load just this file
			  collection.push( {
			  	src: file,
			  	text: readFile(file)
			  } )
			}
			else { // assume its a directory
				this.files(file, function(path, f){
					if(/\.(js|md|markdown)$/.test(f)){
					  collection.push( {
					  	src: path,
					  	text: readFile(path)
					  } )
				    }
				})
				
				
			}
			return collection;
		}
	};

	return function(scripts, options){
		var scriptsToProcess = [];
		// an array of folders
		if(options.markdown){
			for(var i =0 ; i < options.markdown.length; i++){
				helpers.files(options.markdown[i], function(path, f){
					if(/\.(md|markdown)$/.test(f) && !/node_modules/.test(path)){
					  scriptsToProcess.push( {
					  	src: path,
					  	text: readFile(path)
					  } )
				    }
				})
			}
		}
		if(typeof scripts == 'string'){
			if(!options.out){
				if(/\.html?$|\.js$/.test(scripts)){
					options.out = scripts.replace(/[^\/]*$/, 'docs')
				}else{ //folder
					options.out = scripts+"/docs";
				}
			}
			new steal.URI(options.out).mkdir();
			scriptsToProcess.push.apply(scriptsToProcess, helpers.getScripts(scripts))
		} else if(scripts instanceof Array){
			new steal.URI(options.out).mkdir();
			trueScriptsArr = [];
			for(idx in scripts) {
				files = helpers.getScripts(scripts[idx]);
				trueScriptsArr = trueScriptsArr.concat(files);
			}
			scriptsToProcess.push.apply(scriptsToProcess, trueScriptsArr);
		}
		return scriptsToProcess;
	}
})