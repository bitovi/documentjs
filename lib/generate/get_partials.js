var Handlebars = require("handlebars");

var fsx = require('../fs_extras'),
	path = require('path');
	
var	Q = require('q');

// this should be called 
module.exports = function(folder){
	var dir = folder || 'documentjs/site/templates';
	
	return fsx.readdir(dir).then(function(files){
		
		var promises = files.map(function(filename){
			return  fsx.readFile(path.join(dir, filename)).then(function(template){
				Handlebars.registerPartial(filename, template.toString());
			});
		});
		
		return Q.all(promises)
		
	});
	
	
};
