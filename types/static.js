DocumentJS.Type("static",{
	code : function(){
		return {name: "static"}
	},
	parent : /script|class/,
	useName : true,
	hasChildren : true
})