module.exports = function makePackageJson(options) {
	return {
		name: "docs",
		version: "1.0.0",
		main: "static.js",
		system: {
			npmAlgorithm: "flat",
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
			jquery: "~1.11.0",
			steal: "0.16.X",
			"steal-stache": "^3.0.7",
			"steal-tools": "0.16.X"
		}
	};
};
