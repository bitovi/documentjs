var Q = require("q");
var connect = require("connect");
var Browser = require("zombie");
var getPort = require("get-port");

module.exports = function open(dir, url) {
	var server;
	var browser;

	return Q.resolve(getPort())
		.then(function(port) {
			server = connect()
				.use(connect.static(dir))
				.listen(port);
			browser = new Browser();
			return browser.visit(`http://localhost:${port}/${url}`);
		})
		.then(function() {
			return browser;
		})
		.finally(function() {
			server.close();
		});
};
