steal('./tree.js',function(tree){
	
	var eachBetweenCommas = function(arr,cb,betweener){
		var cur = [],
			i = 0,
			betweener = betweener || ",";
		while(i < arr.length){
			
			if(arr[i] == betweener){
				if(cur.length){
					cb(cur);
					cur  = [];
				} 
			} else {
				cur.push(arr[i])
			}
			i++
		}
		if(cur.length){
			cb(cur);
		} 
	};

	
	var process = function(children, obj){
		
		if(!children || !children.length){
			return obj;
		} else if(typeof children[0] === "string") {

			switch(children[0]){
				case "|":
					process(children.slice(1), obj);
					break;
				case "=": 
					obj.optional = true;
					// get default value
					if(children[1]){
						obj.defaultValue = process([children[1]],{}).types[0];
					}
					process(children.slice(2), obj);
					break;
				
				case "?": 
					obj.nullable = true;
					process(children.slice(1), obj);
					break;
				case "!":
					obj.nonnull = true;
					process(children.slice(1), obj);
					break;
				case "Function":
				case "function":
					var types = obj.types || (obj.types = []),
						type = {type: "function"};
					types.push(type);
					
					type.constructs = undefined;
					type.returns = {types: [{type: "undefined"}]};
					type.params = [];
					type.context = undefined;
					
					var next = children[1];
					if(next && next.type == "(") {
						eachBetweenCommas(next.children, function(typeChildren){
							if(typeChildren[1] == ":"){
								if(typeChildren[0] == "new"){
									type.constructs = process( typeChildren.slice(2), {} );
								} else if(typeChildren[0] == "this"){
									type.context = process( typeChildren.slice(2), {} );
								}
							} else {
								type.params.push(
									process(typeChildren, {})
								)
							}
						});
						if( children[3] ) {
							type.returns = process( children.slice(3), {} )
						};
					} else {
						process( children.slice(1), obj )
					}
					// children[2] === ":"
					
					break;
				case "...":
					obj.variable = true;
					process(children.slice(1), obj);
					break;
				default: // a type name like {Animal}
					var types = obj.types || (obj.types = []),
						type = {type: 
						// correct for Foo.<>
						children[0].replace(/\.$/,"")
					};
					types.push(type);
					
					var next = children[1];
					if(next) {
						switch(next.type){
							case "<":
								type.template = [];
								eachBetweenCommas(next.children, function(typeChildren){
									type.template.push(
										process(typeChildren, {})
									)
								});
								break;
							default: 
								// do anything at the end ...
								process(children.slice(1), obj)
								break;
						}
					}
			}
		} else if(children[0].type){
			switch(children[0].type){
				
				case "{": // Record object {foo: Bar, cat, dog}
				
					var types = obj.types || (obj.types = []),
						type = {type: "Object"};
					types.push(type);
					type.options = [],
					eachBetweenCommas(children[0].children, function(typeChildren){
						var option = {
							name: typeChildren[0]
						}
						if(typeChildren[2]){
							process(typeChildren.slice(2), option)
						}
						type.options.push(option)
					})
					break;
					
				case "(": // Union (foo|bar)

					eachBetweenCommas(children[0].children,function(typeChildren){
						process(typeChildren, obj )
					},"|")
			}
		}
		return obj
	}

	return {
		tokens: ["\\?", "\\!", "function", "\\.\\.\\.", ",", "\\:", "\\|", "="],
		process: process,
		type: function(str){
			return process(this.tree(str), {})
		},
		tree: function(str){
			return tree(str, "("+this.tokens.join("|")+")", "(\\s)" );
		}
	}
	
});


