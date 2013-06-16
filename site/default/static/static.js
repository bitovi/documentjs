steal("./styles/styles.less","./prettify",function(){
	var codes = document.getElementsByTagName("code");
	for(var i = 0; i < codes.length; i ++){
		var code = codes[i];
		if(code.parentNode.nodeName.toUpperCase() === "PRE"){
			code.className = code.className +" prettyprint"
		}
	}
	prettyPrint();
})
