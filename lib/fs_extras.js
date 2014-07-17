var	fs = require('fs-extra'),
	Q = require('q'),
	path = require('path');

var mkdirs = Q.denodeify(fs.mkdirs),
	copy = Q.denodeify(fs.copy),
	readFile = Q.denodeify(fs.readFile),
	readdir = Q.denodeify(fs.readdir),
	folder = "documentjs",
	root = __dirname.substr(0, __dirname.lastIndexOf(folder));
	
exports.copy = function(src, dest){
	return copy(path.join(root, src), path.join(root,dest) );
};
exports.copyTo = function(src, dest){
	return copy(path.join(root, src), dest );
};
// relative to documentjs on the destination
exports.copyFrom = function(src, dest){
	return copy(src, path.join(root, dest ) );
};

exports.mkdirs = function(dir){
	return mkdirs( path.join(root, dir) );
};
exports.exists = function(dir){
	var deferred = Q.defer();
	fs.exists( path.join(root, dir), function(exists){
		deferred.resolve(exists);
	});
	return deferred.promise;
};
exports.readFile = function(filename){
	return readFile( path.join(root, filename) );
};
exports.readdir = function(filename){
	return readdir( path.join(root, filename) );
};