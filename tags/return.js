DocumentJS.Tags["return"] = {
    add: function(line){
		if(!this.ret){
			this.ret = {type: 'undefined',description: ""}
		}
        
		var parts = line.match(/\s*@return\s+(?:\{([\w\|\.\/]+)\})?\s*(.*)?/);
        
        if(!parts) {
           return; 
        }
        
        var description = parts.pop() || "";
        var type = parts.pop();
        this.ret = {description: description, type: type};
        return this.ret;
    },
    addMore : function(line){
        this.ret.description += "\n"+line;
    }
};