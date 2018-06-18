var Q = require("q");
var connect = require("connect");
var Browser = require("zombie");

module.exports = function open(dir, url) {
	var server = connect()
		.use(connect.static(dir))
		.listen(8081);
	var browser = new Browser();
	return Q.resolve(browser.visit("http://localhost:8081/" + url))
		.then(function() {
			return browser;
		})
		.finally(function() {
			server.close();
		});
};
