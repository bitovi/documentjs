(function () {
	var isClient = typeof window !== "undefined";
	System.config({
		map: {
			"jquery/jquery": "jquery",
			"can/util/util": "can/util/jquery/jquery",
			"benchmark/benchmark": "benchmark",
			"mustache": "can/view/mustache/system"
		},
		paths: {
			"jquery": isClient ? "jquery/dist/jquery.js" : "../../../../node_modules/jquery/dist/jquery.js",
			"can/*": isClient ? "can/*.js" : "../../../../node_modules/can/*.js"
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
