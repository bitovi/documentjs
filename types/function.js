/**
 * @class DocumentJS.Function
 * @tag documentation
 * @parent DocumentJS.Type
 * Properties of a function.
 */
DocumentJS.Type("function",
/**
 * @Static
 */
{
	codeMatch: /(?:([\w\.]+)|(["'][^"']+["']))\s*[:=]\s*function\s?\(([^\)]*)/,
	//must return the name if from the code
	code : function(code){
		var parts = this.codeMatch(code);

        if(!parts){
            parts = code.match(/\s*function\s+([\w\.\$]+)\s*(~)?\(([^\)]*)/)
        }
        var data = {};
		if(!parts){
			return;
		}
        data.name = parts[1] ? parts[1].replace(/^this\./,"") : parts[2];
		
        //clean up name if it has ""
        if(/^["']/.test(data.name)){
            data.name = data.name.substr(1, data.name.length-2).replace(/\./g,"&#46;").replace(/>/g,"&gt;");
        }
        data.params = {};
        data.ret = {type: 'undefined',description: ""}
        var params = parts[3].match(/\w+/g);

        if(!params) return data;
        
        for(var i = 0 ; i < params.length; i++){
            data.params[params[i]] = {description: "", type: "", optional: false, order: i, name: params[i]};
        }
		
		return data;
	},
	parent : /script|static|proto|class/,
	useName : false
})