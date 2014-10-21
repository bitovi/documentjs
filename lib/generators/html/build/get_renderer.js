var Handlebars = require("handlebars");

var fsx = require('../../../fs_extras');
	
var	Q = require('q');

var _ = require("lodash");

// this should be called 
module.exports = function(dir, OtherHandlebars){
	
	var deferred = Q.defer();
	
	return Q.all([
		fsx.readFile(dir+'/layout.mustache'),
		fsx.readFile(dir+'/content.mustache')
	]).then(function(result){
		var layout = (OtherHandlebars || Handlebars).compile(result[0].toString());
		var render = (OtherHandlebars || Handlebars).compile(result[1].toString());
		
		var renderer = function(data){
			var content = render(data);
			// pass that content to the layout
			return layout(_.extend({
				content: content
			}, data));
		};
		renderer.layout = layout;
		renderer.content = render;
		renderer.Handlebars = (OtherHandlebars || Handlebars);
		return renderer;
	});
	

};
