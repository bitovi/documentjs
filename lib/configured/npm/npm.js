var Q = require("q");
var path = require("path");
var spawn = require("cross-spawn-async");
var mkdirs = Q.denodeify(require("fs-extra").mkdirs);

exports.installInPath = function(pth, module, version){
	var cwd = process.cwd();
	pth = path.resolve(pth);
	process.chdir(pth);

	var nmPth = path.join(pth, "node_modules");

	return mkdirs(nmPth).then(function(){
		return exports.install(module, version);
	}).then(function(res){
		process.chdir(cwd);
		return res;
	});
};

exports.install = function(module, version){
	if(version) {
		module = module + "@" + version;
	}
	if(!Array.isArray(module)) {
		module = [ module ];
	}

	return exports.runCommand(["install"].concat(module));
};

exports.runCommand = function(args){
	var child = spawn("npm", args, {
		cwd: process.cwd(),
		stdio: "inherit"
	});

	var deferred = Q.defer();

	child.on("exit", function(status){
		if(status) {
			deferred.reject(new Error("Command `npm` did not complete successfully"));
		} else {
			deferred.resolve(child);
		}
	});
	
	return deferred.promise;
}
