var fs = require('fs');
var path = require('path');
var _ = require('underscore');
var Handlebars = require('handlebars');

// DocumentJS static page generator
function staticPages(folder, data, callback) {
	var template = path.join(folder, '/_layouts/page.mustache');
	var pagePath = path.join(folder, '/_pages/');

	if(!fs.existsSync(template)) {
		throw new Error('Could not find page template ' + template);
	}

	var layout = Handlebars.compile(fs.readFileSync(template).toString());

	fs.readdir(pagePath, function(error, files) {
		files.forEach(function(file) {
			var source = fs.readFileSync(path.join(pagePath, file)).toString();
			var renderer = Handlebars.compile(source);
			var page = file.substring(0, file.lastIndexOf('.'));
			var filename = path.join(folder, '/' + page + '.html');
			var source = layout(_.extend({
				root: '',
				page: page,
				content: renderer(data)
			}, data));

			fs.writeFile(filename, source, function() {
				console.log('Wrote filename ' + filename);
			});
		});
	});
}

staticPages(__dirname + '/../canjs.us/', {
	link: {}
});
