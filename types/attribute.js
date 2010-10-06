DocumentJS.Type("attribute",{
	codeMatch: function(code){
		return code.match(/(\w+)\s*[:=]\s*/) && !code.match(/(\w+)\s*[:=]\s*function\(([^\)]*)/)  
	},
	//must return the name if from the code
	code : function(code){
		var parts = code.match(/(\w+)\s*[:=]\s*/);
        if(parts){
			return {
				name: parts[1]
			}
		}
	},
	parent : /script|static|proto|class/,
	useName : false
});