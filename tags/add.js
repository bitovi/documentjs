steal(function(){
	/**
	 * 
	 */
	return {
		add: function(line, curData, scope, docMap){
			
			var name = line.match(/\s*@add\s*([^\s]+)/)[1]
			if(name){
				var docObject = docMap[name] ?
					docMap[name] :
					docMap[name] = {name: name};
				return ["scope",docObject]
			}
		}
	}
})
