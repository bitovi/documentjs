var fsx = require('../fs_extras');
var	Q = require('q');

module.exports = function(options){
	return fsx.mkdirs("documentjs/site/templates").then(function(){
		return fsx.copy("documentjs/site/default/templates","documentjs/site/templates").then(function(){
			if(options["templates"]){
				console.log("Copying templates from "+options["templates"])
				return fsx.copyFrom(options["templates"],"documentjs/site/templates")
			}
		});
	});
};

