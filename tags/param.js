(function(){
	
var ordered = function(params){
	var arr = [];
	for(var n in params){
		var param = params[n];
		arr[param.order] = param;
	}
	return arr;
}


/**
 * @class DocumentJS.Tags.param
 * @tag documentation
 * @parent DocumentJS.Tags 
 * 
 * Adds parameter information of the format: "@param {_optional:_type} name description" .
 *
 * Matches multiple lines. 
 */
DocumentJS.Tags.param = {
	
	addMore : function(line, last){
		if(last)
			last.description += "\n"+line;
	},
	/**
	 * Adds @param data to the constructor function
	 * @param {String} line
	 */
	add: function(line){
		if(!this.params){
			this.params = {};
		}
		var parts = line.match(/\s*@param\s+(?:\{?([^}]+)\}?)?\s+([^\s]+) ?(.*)?/);
		if(!parts){
			print("LINE: \n"+line+"\n does not match @params {TYPE} NAME DESCRIPTION")
			return;
		}
		var description = parts.pop();
		var n = parts.pop(), optional = false, defaultVal;
		//check if it has anything ...
		var nameParts = n.match(/\[([\w\.]+)(?:=([^\]]*))?\]/)
		if(nameParts){
			optional = true;
			defaultVal = nameParts[2]
			n = nameParts[1]
		}
		
		var param = this.params[n] ? this.params[n] : this.params[n] = {order: ordered(this.params).length };

		param.description = description || "";
		param.name = n;
		param.type = parts.pop()|| "";
		

		param.optional = optional;
		if(defaultVal){
			param["default"] = defaultVal;
		}
		
		return this.params[n];
	}
};

})()