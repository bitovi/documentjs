//steal.config({
//	root: __dirname + '/../',
//	map: {
//		'*': {
//			'documentjs/': ''
//		}
//	}
//});

steal('./types/script.js', './searchdata.js', function(Script, searchdata) {
	var DocumentJS = function(files, callback) {
		var objects = {};

		files.forEach(function(filename) {
			var script = {
				src: filename,
				text: readFile(filename)
			};

			Script.process(script, objects);
		});

		callback(null, objects, searchdata(objects));
	};

	return DocumentJS;
});
