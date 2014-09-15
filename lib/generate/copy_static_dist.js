var fss = require('../fs_extras.js'),
	Q = require('q'),
	path = require("path"),
	md5 = require("MD5"),
	fs = require('fs-extra'),
	mkdirs = Q.denodeify(fs.mkdirs);


module.exports = function(options){
	var dest = path.join(options.dest,"static");
	var distFolder =  path.join('documentjs','site','static','dist', md5(options.dest));
	return mkdirs(dest).then(function(){
		console.log("BUILD: Copying production files to "+path.relative(process.cwd(),dest));
		return fss.copyTo(distFolder,dest);
	});
};