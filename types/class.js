DocumentJS.Type("class",{
	codeMatch: /([\w\.\$]+?).extend\(\s*["']([^"']*)["']/,  // /([\w\.]*)\s*=\s*([\w\.]+?).extend\(/,
	//must return the name if from the code
	funcMatch : /(?:([\w\.]+)|(["'][^"']+["']))\s*[:=]\s*function\s?\(([^\)]*)/,
	code : function(code){
		var parts = code.match(this.codeMatch);
		if(parts){
			return {
				name: parts[2],
				inherits: parts[1].replace("$.","jQuery.")
			}
		};
		parts = code.match(this.funcMatch)
		if(parts){
			return {
				name: parts[1] ? parts[1].replace(/^this\./,"") : parts[2]
			}
		}
	},
	parent : /script/,
	useName : true,
	hasChildren : true
})