/**
 * Find [property] in browser's window object
 * @param {Object} browser Zombie browser instance
 * @param {String} property The property name to be looked for in window
 * @return {Promise<property>}
 */
module.exports = function find(browser, property) {
	return new Promise(function(resolve, reject) {
		var start = new Date();
		var check = function() {
			if (browser.window && browser.window[property]) {
				resolve(browser.window[property]);
			} else if (new Date() - start < 2000) {
				setTimeout(check, 20);
			} else {
				reject(new Error("failed to find " + property));
			}
		};
		check();
	});
};
