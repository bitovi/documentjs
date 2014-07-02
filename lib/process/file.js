var cleanIndent = require("../clean_indent");
var processDoc = require("./doc");

/**
 * @module documentjs/lib/process/file
 * 
 * Processes a file's source.  Adds created doc objects to docMap.
 * 
 * @param {String} source A files source
 * @param {DocMap} docMap A map of the name of each DocObject to the DocObject
 * @param {String} [filename] The filename.  If a filename is not provided, 
 * the entire file is treated as one big comment block.  If a filename is provided
 * and is not a .md or .markdown file, it is assumed to be a source file.
 */
module.exports = function processFile(source, docMap, filename ) {
	if (ignoreCheck.test(source)) {
		return;
	}
	
	// The current scope is a script.  It will be the parent
	// if there is no other parent.
	var scope = {
			type: "script",
			name: filename + ""
		},
		// which comment block we are on
		commment;
		
	// A callback that gets called with the docObject created and the scope
	function typeCreateHandler(docObject, newScope) {
		
		if (docObject && docObject.name) {
			
			if (docMap[docObject.name]) {
				// merge props
				for (var prop in docObject) {
					// only change if there is a value
					if( docObject[prop] ) {
						docMap[docObject.name][prop] = docObject[prop];
					}
				}
			} else {
				docMap[docObject.name] = docObject;
			}

			docObject.src = filename + "";
			if (comment) {
				docObject.line = comment.line;
			}
		}
		if (newScope) {
			scope = newScope;
		}
	};
	
	if (!filename || /\.(md|markdown)$/.test(filename) ) {

		processDoc.comment({
			comment: source,
			docMap: docMap,
			scope: scope,
			props: {
				type: 'page',
				name: docScript.src.match(/([^\/]+)\.(md|markdown)$/)[1]
			}
		}, typeCreateHandler);

		return;
	} else {
		comments = getComments(source);
		//clean comments
		for (var i = 0; i < comments.length; i++) {
			comment = comments[i];

			//var start = new Date;
			processDoc.codeAndComment({
				code: comment.code,
				comment: comment.comment,
				docMap: docMap,
				scope: scope
			}, typeCreateHandler);
		}
	}
};
var splitter = new RegExp("(?:/\\*+((?:[^*]|(?:\\*+[^*/]))*)\\*+/\[^\\w\\{\\(\\[\"'\$]*([^\\r\\n]*))");
var group = new RegExp("(?:/\\*(?:[^*]|(?:\\*+[^*/]))*\\*+/\[^\\w\\{\\(\\}\\[/]*[^\\n]*)", "g");
var ignoreCheck = /\@documentjs-ignore/;
var commentReg = /\r?\n(?:\s*\*+)?/g;

function getComments(source) {
	var start = new Date;
	//var source = source.replace('\r\n','\n')
	var comments = [],
		match, getLine = lineNumber(source);

	group.lastIndex = 0;


	while (match = group.exec(source)) {
		var lastIndex = group.lastIndex,
			origComment = match[0],
			splits = origComment.match(splitter),
		// the comment after removing leading *
			comment = splits[1].replace(commentReg, '\n'),
			code = splits[2],
			lines = comment.split("\n");

		lines = cleanIndent(lines);
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
		});
	}
	return comments;
};


function lineNumber(source) {

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
	};

};