(function () {

	System.config({
		map: {
			"jquery/jquery": "jquery",
			"can/util/util": "can/util/jquery/jquery",
			"benchmark/benchmark": "benchmark",
			"mustache": "can/view/mustache/system"
		},
		paths: {
			"jquery": "../../../../node_modules/canjs/lib/jquery.1.10.2.js",
			"can/*": "../../../../node_modules/canjs/*.js"
		},
		meta: {
			jquery: {
				exports: "jQuery"
			},
			prettify: {format: "global"}
		},
		ext: {
			ejs: "can/view/ejs/system",
			mustache: "can/view/mustache/system",
			stache: "can/view/stache/system"
		}
	});
})();

System.buildConfig = {
	map: {"can/util/util" : "can/util/domless/domless"}
};
