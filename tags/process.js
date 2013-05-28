steal('steal','documentjs/libs/distance.js',function(s, distance){
	var typeCheckReg = /^\s*@(\w+)/,
		nameCheckReg = /^\s*@(\w+)[ \t]+([\w\.\$\/]+)/m,
		doubleAt = /@@/g,
		matchTag = /^\s*@(\w+)/;
	
	var process = {
		/**
		 * @signature `process(options, callback)`
		 * processes a comment with code
		 * 
		 * @param {{}} options
		 * @option {String} code
		 * @option {Array.<String>} comment
		 * @option {DocObject} scope
		 * @option {DocObject} suggestedProps
		 * 
		 * @param {function(DocObject,DocObject)} callback(newDoc,newScope)
		 * @option newType the new documentation object
		 * @option newScope the new scope
		 */
		codeAndComment: function(options, callback){
			var self = this,
				comment = options.comment;
			
			var firstLine = typeof comment == 'string' ? comment : comment[0],
				check = firstLine.match(typeCheckReg)
			
			if(check){
				if(!options.props){
					options.props = {};
				}
				options.props.type = check[1].toLowerCase();
			}
			
			if(options.code){
				
				this.code(options, function(newDoc, newScope){
					self.comment({
						comment: options.comment,
						scope: newScope || options.scope,
						docMap: options.docMap,
						props: newDoc || options.props || {}
					}, function(newDoc, newScope){
						callback(newDoc, newScope)
					})
					
					
				})
			} else {
				self.comment({
					comment: options.comment,
					scope: options.scope,
					docMap: options.docMap,
					props:  {}
				}, function(newDoc, newScope){
					callback(newDoc, newScope)
				})
			}
		},
		/**
		 * @param {{code: String, scope: DocObject, docMap: DocMap}} options
		 * @option code
		 * @option scope
		 * @option docMap
		 * @param {function(DocObject,DocObject)} callback(newDoc,newScope)
		 * @option newDoc 
		 * @option newScope
		 */
		code: function(options, callback){
			var tag = this.guessTag(options.code, options.props && options.props.type, options.scope),
				docObject;
			if(tag){
				docObject = tag.code(options.code, options.scope, options.docMap);
			}
			callback(docObject, docObject && tag.codeScope ? docObject : options.scope)
		},
		/**
		 * @param {{}} options
		 * @option {String} comment
		 * @option {DocObject} scope
		 * @option {DocMap} docMap
		 * @param {function(DocObject,DocObject)} callback(newDoc,newScope)
		 * @option newDoc 
		 * @option newScope
		 */
		comment: function(options, callback){
			
			var props = options.props, 
				comment = options.comment, 
				objects = options.docMap,
				scope = options.scope;
			
			var i = 0,
				lines = typeof comment == 'string' ? comment.split("\n") : comment,
				len = lines.length,
				typeDataStack = [],
				curTag, lastType, curData, lastData, defaultWrite = 'body',
				//what data we are going to be called with
				tag;

			if (!props.body ) {
				props.body = '';
			}
			if (!props.description ) {
				props.description = '';
			}
			// for each line
			for ( var l = 0; l < len; l++ ) {

				// see if it starts with something that looks like a @tag
				var line = lines[l],
					match = line.match(matchTag);
				// print("--",line)
				// if we have a tag
				if ( match ) {
					// lower case it
					tag = match[1].toLowerCase();
					// get the tag object
					var curTag = process.tags[tag];

					// if we don't have a tag object
					if (!curTag ) {

						// if it's not a type, suggest it as a type and just add it
						// maybe they wanted @foobar
						
						this.suggestType(tag);
						props.comment += line + "\n"
						
						continue;
					} else {
						// ??: why are we setting this?
						curTag.type = tag;
					}
					// call the tag types add method
					//try{
					curData = curTag.add.call(props, line, curData, scope, objects);
					//} catch(e){
					//	print(line);
					//	throw e;
					//}
					// depending on curData, we do different things:
					// if we get ['push',{DATA}], this means we are an
					// 'inline' tag, meaning we are going to add
					// content to whatever tag we are currently in
					// @codestart and @codeend are the best examples of this
					if ( curData && curData.length == 2 && curData[0] == 'push' ) { //
						// push the current data and type on the stack
						typeDataStack.push({
							type: lastType,
							data: lastData
						})
						// set ourselves as the current lastType and the 2nd
						// item in the array as curData
						curData = curData[1];
						lastType = curTag;
					}
					// if we get ['pop', text],
					// add text to the previous parent tag
					else if ( curData && curData.length == 2 && curData[0] == 'pop' ) {
						// get the last tag
						var last = typeDataStack.pop();

						// as long as we had a previous tag
						if ( last && last.type ) {
							//call the previous tag's addMore
							last.type.addMore.call(props, curData[1], last.data);
						} else {
							// otherwise, add to the default place to write to
							props[defaultWrite] += "\n" + curData[1]
						}
						// restore the old data
						lastData = curData = last.data;
						lastType = curTag = last.type;
					} else if (curData && curData.length == 2 && curData[0] == 'scope' ) {
						curData = scope = curData[1]
					} else if ( curData && curData.length == 2 && curData[0] == 'default' ) {
						// if we get ['default',PROPNAME]
						// we change default write to prop name
						// this will make it so if we aren't in a tag, all default
						// lines to to the defaultWrite
						// this is used by @constructor
						defaultWrite = curData[1];
						lastType = null;
					}
					// if we have anything else, we store it as the last thing we went to
					else if ( curData ) {
						lastType = curTag;
						lastData = curData;
					}
					else { // remove the last type because this is a single line tag
						lastType = null;
					}


				}
				else {
					// we have a normal line
					//clean up @@abc becomes @abc
					line = line.replace(doubleAt, "@");

					// if we a lastType (we are on a multi-line tag)
					if ( lastType ) {
						lastType.addMore.call(props, line, curData, scope, objects)
					} else {
						// write to the default place
						props[defaultWrite] += line + "\n"
					}
				}
			}


			//props.body = converter.makeHtml(props.body);
			//allow post processing
			for ( var tag in process.tags ) {
				if ( process.tags[tag].done ) {
					process.tags[tag].done.call(props);
				}
			}


			callback(props, scope)
		},
		/**
		 * @property {Object.<String,Tag>} tags
		 */
		tags: {},
		guessTag: function( code, firstGuess, scope ) {
			var matches = function(tag, code){
				if ( process.tags[tag] && 
					 process.tags[tag].codeMatch && 
					(typeof process.tags[tag].codeMatch == 'function' ? 
						process.tags[tag].codeMatch(code) :
						process.tags[tag].codeMatch.test(code) ) ) {
					return process.tags[tag];
				}
			},
				res
			
			
			if(firstGuess &&  (res = matches(firstGuess,code))){
				return res
			}
			// if the scope is static or prototype, favor that
			if(scope && /static|prototype/.test(scope.type) && (res = matches('function',code))  ){
				return res;
			}
			
			for ( var type in process.tags ) {
				if( res = matches(type,code)) {
					return process.tags[type];
				}
			}
			
			
			return null;
		},
		suggestType: function( incorrect, line ) {
			var lowest = 1000,
				suggest = "",
				check = function( things ) {
					for ( var name in things ) {
						var dist = distance(incorrect.toLowerCase(), name.toLowerCase())
						if ( dist < lowest ) {
							lowest = dist
							suggest = name.toLowerCase()
						}
					}
				}
				
			check(process.tags);

//			if ( suggest ) {
//				print("\nWarning!!\nThere is no @" + incorrect + " directive. did you mean @" + suggest + " ?\n")
//			}
		}
	}
	
	/**
	 * @typedef {{}} documentjs/DocObject
	 * An object that represents something that is documented. Any 
	 * property added to a DocObject gets serialized as JSONP and
	 * sent to the client.  The following lists the important, near
	 * universal properties:
	 * 
	 * @option {String} name The unique name of the object being documented. 
	 * @option {String} type The type of the DocType. This typically represents
	 * the type of the object being documented:
	 *  - constructor
	 *  - prototype
	 *  - static
	 *  - function
	 *  - property
	 *  - typedef
	 * 
	 * @option {String} parent The parent 
	 * @option {Array.<String>} children An array of children names. This typically gets
	 * added by the system based on the `parent` property.
	 * 
	 */
	//
	/**
	 * @typedef {{}} documentjs/tags/tag Tag 
	 * An object that describes the behavior of 
	 * a tag.  
	 * @parent documentjs/implementation
	 * 
	 * @option {function(String):Boolean|RegExp} codeMatch(code) Returns true
	 * if the code matches this tag. 
	 * @option {function(String):DocObject} code(codeLine) Takes
	 * @option {Boolean} [codeScope=false] If `code(codeLine)` returns a DocObject,
	 * set this object as the new scope.
	 */
	return process;
	
	
})
