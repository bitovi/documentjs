module.exports = function makePackageJson(options) {
	return {
		name: "docs",
		version: "1.0.0",
		main: "static.js",
		steal: {
			npmAlgorithm: "flat",
			plugins: [
				"steal-less",
				"steal-stache"
			],
			meta: {
				jquery: {
					exports: "jQuery"
				},
				prettify: { format: "global" }
			}
		},
		dependencies: {
			"can-control": "^3.0.10",
			"can-map": "^3.0.7",
			"can-stache": "^3.0.24",
			"can-util": "^3.6.1",
			"jquery": "~1.11.0",
			"steal": "^1.12.3",
			"steal-less": "^1.3.1",
			"steal-stache": "^3.1.3",
			"steal-tools": "^1.11.9",
		}
	};
};
