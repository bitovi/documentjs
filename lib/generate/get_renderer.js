var Handlebars = require("handlebars");

var fsx = require('../fs_extras');
	
var	Q = require('q');

var _ = require("underscore");

// this should be called 
module.exports = function(dir){
	
	
	var deferred = Q.defer();
	
	return Q.all([
		fsx.readFile(dir+'/layout.mustache'),
		fsx.readFile(dir+'/docs.mustache')
	]).then(function(result){
		var layout = Handlebars.compile(result[0].toString());
		var render = Handlebars.compile(result[1].toString());
		
		var renderer = function(data){
			var content = render(data);
			// pass that content to the layout
			return layout(_.extend({
				content: content
			}, data));
		};
		renderer.layout = layout;
		renderer.render = render;
		
		return renderer;
	});
	

};
