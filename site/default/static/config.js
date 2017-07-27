(function () {
	var map = require('./map.json');
	var isClient = typeof window !== "undefined";

	var configData = {
		map: map,
		ext: {
			'stache': 'steal-stache'
		},
		meta: {
			jquery: {
				exports: "jQuery"
			},
			prettify: {format: "global"}
		}
	};

	if(isClient) {
		// when not a client, these values are set by build.js.
		configData.paths = {
			"jquery": "jquery/dist/jquery.js",
			"can/*": "can/*.js"
		};
	}


	System.config(configData);
})();

System.buildConfig = {
	map: {"can/util/util" : "can/util/domless/domless"}
};
