module.exports = function waitFor(browser, checker) {
	return new Promise(function(resolve, reject) {
		var start = new Date();
		var check = function() {
			if (checker(browser.window)) {
				resolve(browser.window);
			} else if (new Date() - start < 2000) {
				setTimeout(check, 20);
			} else {
				reject(new Error("checker was never true"));
			}
		};
		check();
	});
};
