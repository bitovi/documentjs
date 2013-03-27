var steal = require('steal').load;
var fs = require('fs');

steal.root = __dirname + '/../../';

// TODO fix these hacky Rhino shims
global.readFile = function(filename) {
	try {
		return fs.readFileSync(filename).toString();
	} catch(e) {
		return false;
	}
}
global.print = function() {
	console.log.apply(this, arguments);
}

module.exports = function(name, options, callback) {
	steal('documentjs', function(DocumentJS) {
		DocumentJS(name, options);
	});
}
