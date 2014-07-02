
var getHelpers = require("../../site/helpers"),
	_ = require("underscore"),
	Handlebars = require("handlebars");

module.exports = function(data, options, getCurrent){
	
	var helpers = getHelpers(data,options,getCurrent)
	
	if(typeof options.helpers == "function"){
		_.extend(helpers, config.helpers(data, options, getCurrent, helpers) );
	}
	
	if (helpers && Handlebars) {
		_.each(helpers, function (helper, name) {
			Handlebars.registerHelper(name, helper);
		});
	}
};
