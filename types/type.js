DocumentJS.Type = function(type, props){
	DocumentJS.Type.types[type] = props;
	props.type = type;
}
DocumentJS.extend(DocumentJS.Type,{
	types: {},
	//must get type and name
	create: function(comment, code, scope, objects){

		var check =  comment.match(/^\s*@(\w+)/), 
			type,
			props

		if(!(type = this.hasType(check ? check[1] : null)) ){ //try code

			type = this.guessType(code);
		}
		
		if (!type) {
			return null;
		}

		var nameCheck = comment.match(/^\s*@(\w+)[ \t]+([\w\.]+)/m)
		
		props = type.code(code)

		if (!props  && !nameCheck) {
			return null;
		}
		
		if(!props){
			props = {};
		}
		if(nameCheck && nameCheck[2] && nameCheck[1].toLowerCase() == type.type){
			props.name = nameCheck[2]
		}
		if(type.init){
			return type.init(props, comment)
		}
		print(props.name + " "+type.type);
		if(DocumentJS.Application.objects[props.name]){
			var oldProps = props;
			props = DocumentJS.Application.objects[props.name];
			DocumentJS.extend(props, oldProps);
		}
		
		props.type = type.type;
		if(props.name){
			var parent = this.getParent(type, scope)
			
			//if we are adding to an unlinked parent, add parent's name
			if(!parent.type || DocumentJS.Type.types[parent.type].useName){
				props.name = parent.name+"."+props.name
			}
			props.parent =  parent.name;
			if(!parent.children){
				parent.children = [];
			}
			parent.children.push(props.name)
			
			//objects[props.name] = props;
			this.process(props, comment, type)
			return props
		}
	},
	getParent : function(type, scope){
		if(!type.parent){
			return scope;
		}

		
		while(	scope && 
				scope.type && 
				!type.parent.test(scope.type)){

			scope = DocumentJS.Application.objects[scope.parent];

		}
		return scope;
	},
	hasType: function(type){
		if(!type) return null;
		
		return this.types.hasOwnProperty(type.toLowerCase()) ? this.types[type.toLowerCase()] : null;
	},
	guessType: function(code){
		for(var type in this.types){
			if(this.types[type].codeMatch && this.types[type].codeMatch(code) ) {
				return this.types[type];
			}
				
		}
		return null;
	},
	matchTag: /^\s*@(\w+)/,
	process : function(props, comment, type){
		var i = 0,
			lines = comment.split("\n"),
			typeDataStack = [],
			curType,
			lastType,
			curData,
			lastData,
			defaultWrite = 'comment',
			messages = []; //what data we are going to be called with
		
		props[defaultWrite] = '';
		
		//if(!this.params) this.params = {};
		//if(!this.ret) this.ret = {type: 'undefined',description: ""};
		
		//this._last; //what we should be adding too.
		
		for(var l=0; l < lines.length; l++){
			var line = lines[l],
				match = line.match(this.matchTag)
			
			if (match) {
				var curType = DocumentJS.Tags[match[1]];
				
				
				
				if (!curType) {
					//if (!DocumentJS.Pair.hasType(match[1])) {
					//	DocumentJS.Pair.suggest_type(match[1])
					//}
					if(!DocumentJS.Type.types[match[1]]){
						props.comment += line + "\n"
					}
					
					continue;
				}else{
					curType.type = match[1];
				}
				messages.push(match[1])
				curData = curType.add.call(props, line, curData);
				
				//last_data = this[fname](line, last_data);
				
				//horrible ... fix
				if (curData && curData.length == 2 && curData[0] == 'push') {  //
					typeDataStack.push({
						type: lastType,
						data: lastData
					})
					curData = curData[1];
					lastType = curType;
				}
				else if(curData && curData.length == 2 && curData[0] == 'pop'){
					var last = typeDataStack.pop();
					
					if(last && last.type){
						last.type.addMore.call(props, curData[1], last.data);
					}else{
						props[defaultWrite] += "\n"+ curData[1]
					}
					
					lastData = curData = last.data;
					lastType = curType = last.type;
				}else if(curData && curData.length == 2 && curData[0] == 'default'){
					defaultWrite = curData[1];
				}
				else if (curData) {
					lastType = curType;
					lastData = curData;
				}
				else {
					//this._last = null;
					lastType = null;
				}
					
				
			}
			else {
				
				//clean up @@abc becomes @abc
				line = line.replace(/@@/g,"@");
				
				if(lastType){
					lastType.addMore.call(props, line,curData)
				}else{
					props[defaultWrite] += line + "\n"
				}
			}
		}
		if(messages.length){
			print("  >"+messages.join())
		}
			
		//if(this.comment_setup_complete) this.comment_setup_complete();

		try{
			props.comment = DocumentJS.converter.makeHtml(props.comment);
		}catch(e){
			print("Error with converting to markdown")
		}

	}
});

