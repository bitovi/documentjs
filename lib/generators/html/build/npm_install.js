var spawn = require("cross-spawn");

module.exports = function npmInstall(spawnArgs) {
	return new Promise(function(resolve, reject) {
		var proc = spawn(
			"npm",
			["install", "--no-bin-links", "--no-package-lock", "--no-audit"],
			spawnArgs
		);

		proc.once("exit", function(code) {
			if (code === 0) {
				resolve();
			} else {
				reject(new Error(`exit code ${code}`));
			}
		});
	});
};
