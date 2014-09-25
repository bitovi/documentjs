var distance = require("../distance");

var	doubleAt = /@@/g,
	matchTag = /^\s*@(\w+)/;
/**
 * @function documentjs.process.comment
 * @parent documentjs.process.methods
 * 
 * @signature `documentjs.process.comment(options, callback)`
 * 
 *  Processes a comment and produces a docObject.
 * 
 * @param {documentjs.process.processOptions} options An options object that contains
 * the code and comment to process.
 * 
 * @param {function(documentjs.process.docObject,documentjs.process.docObject)} callback(newDoc,newScope)
 * 
 * A function that is called back with a docObject created from the code and the scope
 * `docObject`.  If
 * no docObject is created, `newDoc` will be null. 
 */
module.exports = function(options, callback){
		
	var props = options.docObject || {}, 
		comment = options.comment, 
		objects = options.docMap,
		scope = options.scope,
		tags = options.tags;
	
	var i = 0,
		lines = typeof comment == 'string' ? comment.split("\n") : comment,
		len = lines.length,
		typeDataStack = [],
		curTag, lastType, curData, lastData, 
		// Where we are currently writing to.
		currentWrite,
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
			var curTag = tags[tag];

			// if we don't have a tag object
			if (!curTag ) {

				// if it's not a type, suggest it as a type and just add it
				// maybe they wanted @foobar
				
				suggestType(tags, tag);
				props.comment += line + "\n"
				
				continue;
			} else {
				// ??: why are we setting this?
				curTag.type = tag;
			}
			// call the tag types add method
			try{
				curData = curTag.add.call(props, line, curData, scope, objects, currentWrite );
			} catch(e){
				console.log("ERROR:")
				console.log("   tag -", tag);
				console.log("   line-",line);
				throw e;
			}
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
					props[currentWrite || "body"] += "\n" + curData[1]
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
				// lines to to the currentWrite
				// this is used by @constructor
				currentWrite = curData[1];
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
				if(currentWrite){
					props[currentWrite] += line + "\n";
				} else {
					// if we don't have two newlines, keep adding to description
					if( props.body ){
						props.body += line + "\n"
					} else if(!props.description){
						props.description += line + "\n"
					} else if(!line ||  /^[\s]/.test( line ) ){
						currentWrite = "body";
						props[currentWrite] += line + "\n";
					} else {
						props.description += line + "\n"
					}
				}
				
			}
		}
	}

	//allow post processing
	for ( var tag in tags ) {
		if ( tags[tag].done ) {
			tags[tag].done.call(props);
		}
	}


	callback(props, scope);
};


function suggestType(tags, incorrect, line ) {
	var lowest = 1000,
		suggest = "",
		check = function( things ) {
			for ( var name in things ) {
				var dist = distance(incorrect.toLowerCase(), name.toLowerCase());
				if ( dist < lowest ) {
					lowest = dist;
					suggest = name.toLowerCase();
				}
			}
		};
		
	check(tags);

	if ( suggest ) {
		console.warn("\WARNING!!\nThere is no @" + incorrect + " directive. did you mean @" + suggest + " ?\n");
	}
};