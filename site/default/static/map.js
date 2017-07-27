var fs = require('fs');
var path = require('path');

// Helper for recursively getting all the JS files in a directory
var getJSFiles = function(dir, filelist) {
	var files = fs.readdirSync(dir);
	filelist = filelist || [];
	files.forEach(function(file) {
		if (file !== 'node_modules') {
			var fullPath = path.join(dir, file);
			if (fs.statSync(fullPath).isDirectory()) {
				filelist = getJSFiles(fullPath, filelist);
			} else if (file.substr(-3) === '.js') {
				filelist.push(fullPath);
			}
		}
	});
	return filelist;
};

// Get most of the can-* and steal-* packages from node_modules
var getCanAndStealModules = function(moduleFolder) {
	try {
		var fileNames = fs.readdirSync(path.join(moduleFolder, 'node_modules'));
		return fileNames.filter(function(fileName) {
			var isCanModule = fileName.substr(0, 4) === 'can-';
			var isStealModule = fileName.substr(0, 6) === 'steal-' && fileName !== 'steal-tools';
			return isCanModule || isStealModule;
		});
	} catch (error) {
		return;
	}
};
var moduleNames = getCanAndStealModules('');

// This map will be exported
var modulesMap = {
	"benchmark/benchmark": "benchmark",
	"jquery/jquery": "jquery"
};

// This function is used recursively to update the exported modulesMap
var updateMapWithModules = function(moduleNames, prefix) {
	moduleNames.forEach(function(moduleName) {

		// If the module has already been defined, skip it
		if (modulesMap[moduleName]) {
			return;
		}

		var moduleMap = {};
		var modulePath = path.join(prefix, 'node_modules', moduleName);

		// Get all of the .js files in this module’s directory
		var jsFiles = getJSFiles(modulePath);

		// Run through all the JS files in the module and create a map like
		// "can-cid": {"build": "can-cid/build"}
		jsFiles.forEach(function(jsFile) {
			// jsFile looks like node_modules/can-cid/build.js
			// or node_modules\can-cid\build.js on Windows

			// …normalize to use forward slashes for the module names
			var jsFileModule = jsFile.replace(new RegExp('\\\\', 'g'), '/');

			// pathWithModuleName will look like “can-cid/build”
			var pathWithModuleName = jsFileModule.substr((prefix.length ? prefix.length + 1 : 0) + 'node_modules'.length + 1).slice(0, -3);

			// pathWithoutModuleName will look like “build”
			var pathWithoutModuleName = pathWithModuleName.substr(moduleName.length + 1);

			// for the main file (e.g. can-cid/can-cid), include the full path;
			// otherwise, used the short module name (e.g. can-cid/build)
			if (pathWithoutModuleName === moduleName) {
				moduleMap[pathWithoutModuleName]= jsFileModule;
			} else {
				moduleMap[pathWithoutModuleName]= pathWithModuleName;
			}
		});

		// Update the exported map
		modulesMap[moduleName] = moduleMap;

		// If this module has node_modules that are can-* or steal-*,
		// then go through them recursively
		var subModuleNames = getCanAndStealModules(modulePath);
		if (subModuleNames) {
			updateMapWithModules(subModuleNames, modulePath);
		}
	});
};

// Start at the root folder
updateMapWithModules(moduleNames, '');

module.exports = modulesMap;
