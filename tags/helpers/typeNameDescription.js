steal('./namer.js','./typer.js',function(namer, typer){
	return function(line){
			var children = typer.tree(line);
			
			// @function will be broken up by tree, lets put that back together
			if(children[0] == "@" && children[1] == "function"){
				children.splice(0,2,"@function")
			}
			if(children.length <= 1){
				return {};
			}
			var param = {},
				description,
				nameChildren;
			
			// starts with an object
			if(children[1].type == "{"){
				typer.process(children[1].children, param);
				var nameChildren = children[2] ? [children[2]] : [];
				if(children[3] === "function") {
					nameChildren = [nameChildren[0]+"function"]
					
					param.description = line.substr(children[1].end)
						.replace(children[2],"")
						.replace(children[3],"")
					
				} else if(children[3] && children[3].type == "("){
					nameChildren.push( children[3] );
					param.description = line.substr(children[3].end)
				} else {
					if(typeof children[2] == "string"){
						param.description = line.substr(children[1].end).replace(children[2],"")
					} else if(children[2]){ // [foo]
						param.description = line.substr(children[2].end)
					}
					
					
				}
			} else {
				// starts with a name
				var nameChildren = [children[1]];
				if(children[2] && children[2].type == "("){
					nameChildren.push( children[2] );
					param.description = line.substr(children[2].end)
				} else if(children[2] == "function") { 
					nameChildren = [nameChildren[0]+"function"];
					
					param.description = line.replace(children[0],"").replace(children[1]+'function',"")
				} else {
					param.description = line.replace(children[0],"").replace(children[1],"")
				}
			}
			
			// include for function naming
			namer.process( nameChildren, param);
			
			// clean up the description
			param.description = (param.description||"").replace(/^\s+/,"");
			return param
	}
})
