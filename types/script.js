steal('documentjs/tags/process.js', 'documentjs/tags', function (process, tags) {

	process.tags = tags;

	var ignoreCheck = /\@documentjs-ignore/,
		commentReg = /\r?\n(?:\s*\*+)?/g,
		spaceReg = /\S/g,
		newLine = /\n/g,
		lineNumber = function (source) {
			// reset lastIndex
			newLine.lastIndex = 0;

			var curLine = 0,
				curIndex, lines, len;


			return function (index) {
				if (!lines) {
					lines = source.split('\n');
					curIndex = lines[0].length + 1;
					len = lines.length;
				}
				// if we haven't already, split the 	
				if (index <= curIndex) {
					return curLine;
				}
				curLine++;
				while (curLine < len && (curIndex += lines[curLine].length + 1) <= index) {
					curLine++;
				}
				return curLine;
			}

		};

	//commentTime = 0;
	//processTime = 0;

	/**
	 * Represents a file.
	 * Breaks up file into comment and code parts.
	 * Creates new [DocumentJS.Pair | Doc.Pairs].
	 * @hide
	 */
	var Script = {

		// removes indent inline
		removeIndent: function (lines) {
			// first calculate the amount of space to remove
			// and get lines starting with text content 
			var removeSpace = Infinity,
				noSpace = spaceReg,
				match, contentLines = [],
				hasContent = false,
				line, l;

			// for each line
			for (l = 0; l < lines.length; l++) {
				line = lines[l];
				// test if it has something other than a space
				match = noSpace.exec(line);
				// if it does, and it's less than our current maximum
				if (match && line && noSpace.lastIndex < removeSpace) {
					// update our current maximum
					removeSpace = noSpace.lastIndex;
					// mark as starting to have content
					hasContent = true;
				}
				// if we have content now, add to contentLines
				if (hasContent) {
					contentLines.push(line);
				}
				// update the regexp position
				noSpace.lastIndex = 0;
			}
			// remove from the position before the last char
			removeSpace = removeSpace - 1;

			// go through content lines and remove the removeSpace
			if (isFinite(removeSpace) && removeSpace !== 0) {
				for (l = 0; l < contentLines.length; l++) {
					contentLines[l] = contentLines[l].substr(removeSpace);
				}
			}
			return contentLines;
		},
		getCommentCodePairs: function () {

		},
		group: new RegExp("(?:/\\*(?:[^*]|(?:\\*+[^*/]))*\\*+/\[^\\w\\{\\(\\}\\[/]*[^\\n]*)", "g"),

		// (?:/\*+((?:[^*]|(?:\*+[^*/]))*)\*+/[^\w\{\(\[\"'\$]*([^\r\n]*))
		splitter: new RegExp("(?:/\\*+((?:[^*]|(?:\\*+[^*/]))*)\\*+/\[^\\w\\{\\(\\[\"'\$]*([^\\r\\n]*))"),

		/**
		 * @description Generates the docs from a file.
		 * @param {Object|String} docScript An object that has src and text attributes.  It can also just be
		 * the path of a file. (Filenames are not supported yet.)
		 */
		process: function (docScript, objects) {
			if (typeof docScript == 'string') {
				throw new Error('Filenames not supported!');
			}
			var source = docScript.text;
			//check if the source has @documentjs-ignore
			if (ignoreCheck.test(source)) {
				return;
			}
			var script = {
					type: "script",
					name: docScript.src + ""
				},
				scope = script,
				comments,
				type,
				comment,
				typeCreateHandler = function (docObject, newScope) {
					//processTime = processTime + (new Date - start)
					if (docObject && docObject.name) {
						
						if (objects[docObject.name]) {
							// merge props
							for (var prop in docObject) {
								// only change if there is a value
								if( docObject[prop] ) {
									objects[docObject.name][prop] = docObject[prop];
								}
							}
						} else {
							objects[docObject.name] = docObject;
						}

						docObject.src = docScript.src + "";
						if (comment) {
							docObject.line = comment.line;
						}
						/*if(docObject.parent){
						 var parent = objects[docObject.parent] ?
						 objects[docObject.parent] : objects[docObject.parent] = {}
						 if(!parent.children){
						 parent.children = [];
						 }
						 parent.children.push(docObject.name)
						 }*/
					}
					if (newScope) {
						scope = newScope
					}
				}

			objects[script.name] = script;

			// handle markdown docs
			if (/\.(md|markdown)$/.test(docScript.src)) {

				process.comment({
					comment: source,
					docMap: objects,
					scope: scope,
					props: {
						type: 'page',
						name: docScript.src.match(/([^\/]+)\.(md|markdown)$/)[1]
					}
				}, typeCreateHandler);

				return;
			}

			comments = this.getComments(source);
			//clean comments
			for (var i = 0; i < comments.length; i++) {
				comment = comments[i];

				//var start = new Date;
				process.codeAndComment({
					code: comment.code,
					comment: comment.comment,
					docMap: objects,
					scope: scope
				}, typeCreateHandler)
			}


		},
		// gets an array of comments from this source
		// each comment has
		// - comment : an array of lines that make up the comment
		// - code : the line of code after the comment
		// - line : the line number of the comment
		getComments: function (source) {
			var start = new Date;
			//var source = source.replace('\r\n','\n')
			var comments = [],
				match, getLine = lineNumber(source);

			this.group.lastIndex = 0;


			while (match = this.group.exec(source)) {
				var lastIndex = this.group.lastIndex,
					origComment = match[0],
					splits = origComment.match(this.splitter),
				// the comment after removing leading *
					comment = splits[1].replace(commentReg, '\n'),
					code = splits[2],
					lines = comment.split("\n");

				lines = this.removeIndent(lines);
				// probably want line numbers and such
				// an empty line
				if (!lines.length) {
					continue;
				}
				var line = getLine(lastIndex - origComment.length);

				comments.push({
					comment: lines,
					code: code,
					line: line
				})
			}
			//commentTime = commentTime + (new Date - start)
			return comments;
		}
	};

	return Script;
})
