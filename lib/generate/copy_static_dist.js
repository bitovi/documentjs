var fss = require('../fs_extras.js'),
	Q = require('q'),
	path = require("path");


module.exports = function(options){
	var dest = path.join(options.out,"static");
	return fss.mkdirs(dest).then(function(){
		console.log("BUILD: Copying production files to "+path.relative(process.cwd(),dest));
		fss.copyTo('documentjs/site/static/dist',dest);
	});
};