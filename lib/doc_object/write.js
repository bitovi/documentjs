var deepExtendWithoutBody = require("./deep_extend_without_body"),
	_ = require("underscore"),
	filename = require("./filename"),
	Q = require('q'),
	fs = require("fs"),
	writeFile = Q.denodeify(fs.writeFile),
	path = require("path");

module.exports = function(pageData, render, options){
	
	if (!options.ignore || !options.ignore(pageData, pageData.name) ) {
		
		var out = options.out + '/' + filename(pageData, options);
			
		// merge the current DocObject with the configuration
		var data = _.extend({
			root: "."
		}, options, pageData);
		
		console.log('OUT: ' + path.relative(process.cwd(),out) );

		if (true || options.debug ) {
			data.debug = JSON.stringify(deepExtendWithoutBody(data));
		}
		
		// render the content
		var rendered = render(data);
		
		return writeFile(out, rendered);
	} else {
		var deferred = Q.defer();
		deferred.resolve();
		return deferred.promise;
	}
	
	
};


/*
var content = renderer(data);
		
		// pass that content to the layout
		var contents = layout(_.extend({
			content: content
		}, data));
 */