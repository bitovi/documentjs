var Handlebars = require("handlebars");

	
var	Q = require('q');


var fsx = require('../fs_extras'),
	fs = require("fs"),
	
	path = require('path'),
	_ = require("underscore"),
	readFile = Q.denodeify(fs.readFile);
	writeFile = Q.denodeify(fs.writeFile);



module.exports = function(options, renderer){
	
	if(options.statics && options.statics.src){
		console.log("Rendering mustache files in "+options.statics.src+" to "+(options.statics.dest||'.'))
		
		return fsx.readdir(options.statics.src).then(function(files){
			
			var promises = [];
			files.forEach(function(name){
				
				if( name.indexOf(".mustache")>0 ) {
					
					promises.push(readFile(path.join(options.statics.src, name)).then(function(template){
						
						var out = path.join( options.statics.dest||'',name.replace(".mustache",".html") );
						var rendere = Handlebars.compile(template);
						
						var data = _.extend({},options,docData);
						data.root = "";
						data.page = name.replace(".mustache","");
						
						var content = render(data);
						
						var staticLocation = path.relative(out, path.join(options.out,"static") );
						
						var contents = renderer.layout(_.extend({
							content: content,
							staticLocation: staticLocation
						}, data));
						
						return writeFile(out, contents);
					}));
				}
				
			});
			
		});
		
	} else {
		var deferred = Q.defer();
		deferred.resolve();
		return deferred.promise;
	}
	
};


