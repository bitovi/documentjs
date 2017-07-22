var fs = require('fs');
var path = require('path');

// Helper for recursively getting all the JS files in a directory
var getJSFiles = function(dir, filelist) {
	var files = fs.readdirSync(dir);
  filelist = filelist || [];
  files.forEach(function(file) {
		var fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      filelist = getJSFiles(fullPath, filelist);
    } else if (file.substr(-3) === '.js' && fullPath.lastIndexOf('node_modules') === 0) {
      filelist.push(fullPath);
    }
  });
  return filelist;
};

// Get all of the can-* and steal-* packages from node_modules
var fileNames = fs.readdirSync('node_modules');
var moduleNames = fileNames.filter(function(fileName) {
	var isCanModule = fileName.substr(0, 4) === 'can-';
	var isStealModule = fileName.substr(0, 6) === 'steal-';
	return isCanModule || isStealModule;
});

// This map will be exported
var modulesMap = {
	"benchmark/benchmark": "benchmark",
	"jquery/jquery": "jquery"
};

moduleNames.forEach(function(moduleName) {
	var moduleMap = {};
	var modulePath = path.join('node_modules', moduleName);
	var jsFiles = getJSFiles(modulePath);

	// Run through all the JS files in the module and create a map like
	// "can-cid": {"build": "can-cid/build"}
	jsFiles.forEach(function(jsFile) {
		// jsFile looks like node_modules/can-cid/build.js

		// …so pathWithModuleName looks like can-cid/build
		var pathWithModuleName = jsFile.substr('node_modules'.length + 1).slice(0, -3);

		// pathWithoutModuleName looks like build
		var pathWithoutModuleName = pathWithModuleName.substr(moduleName.length + 1);

		// don’t include the main file (e.g. can-cid/can-cid)
		if (pathWithoutModuleName !== moduleName) {
			moduleMap[pathWithoutModuleName]= pathWithModuleName;
		}
	});

	modulesMap[moduleName] = moduleMap;
});

module.exports = modulesMap;
