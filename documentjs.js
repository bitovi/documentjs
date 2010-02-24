//steal.plugins('view','lang/class','lang/json');
//

(function(){
	//we want everything under DocumentJS
	DocumentJS = function(){};
	load('steal/rhino/steal.js')
	load('steal/file/file.js')
	load('steal/ejs/ejs.js')
	load('steal/json/json.js')
	load('steal/class/class.js')
	load('steal/loader/loader.js')
	//var steal = steal;
	
	var Loader = steal.Loader;
	
	var extend = steal.extend;
	extend(DocumentJS, steal)
	DocumentJS.EJS = EJS;
	DocumentJS.JSONparse = JSONparse;
	DocumentJS.toJSON = toJSON;
	delete JSONparse;
	delete steal;
	delete EJS;
    delete toJSON;
	
	
	load(
	    'documentjs/application.js',
	    'documentjs/pair.js' ,
	    'documentjs/directives.js',
	    'documentjs/function.js',
	    'documentjs/class.js',
	    'documentjs/constructor.js',
	    'documentjs/file.js',
	    'documentjs/add.js',
	    'documentjs/static.js',
	    'documentjs/prototype.js',
	    'documentjs/attribute.js',
	    'documentjs/page.js'
	)
	
	var loader = new Loader(_args[0]);
	var total = [];
	for(var i =0; i < loader.scripts.length; i++){
		var script = loader.getScriptContent(loader.scripts[i]);
		if(script)
			total.push({src: script, path: loader.scripts[i].src})
	}
	var app = new DocumentJS.Application(total, "documentjs/test");
	
	app.generate();
	
})();








