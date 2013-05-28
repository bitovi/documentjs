var fs = require('fs');
var async = require('async');
var steal = require('steal').load;
var globule = require('globule');

global.print = console.log;

steal.config({
	root: __dirname + '/../',
	map: {
		'*': {
			'documentjs/': ''
		}
	}
});

module.exports = function(files, callback) {
	steal('types/script.js', 'documentjs/site/searchdata.js', function(Script, searchdata) {
		var objects = {};
		var fileList = [];

		files.forEach(function(file) {
			if(fs.existsSync(file)) {
				return fileList.push(file);
			}
			var globbed = globule.find(file);
			if(globbed.length) {
				return fileList.push.apply(fileList, globbed);
			}
		});

		var callbacks = fileList.map(function(file) {
			return function(cb) {
				fs.readFile(file, function(error, data) {
					if(error) {
						return cb(error);
					}

					var script = {
						src: file,
						text: data.toString()
					}

					Script.process(script, objects);

					cb();
				});
			};
		});

		async.series(callbacks, function(error) {
			callback(error, objects, searchdata(objects));
		})
	});
}
