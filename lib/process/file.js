var cleanIndent = require("./clean_indent"),
	processComment = require("./comment"),
	processCodeAndComment = require("./code_and_comment"),
	tags = require("../tags/tags"),
	addDocObjectToDocMap = require("./add_doc_object_to_doc_map");

/**
 * @function documentjs.process.file
 * @parent documentjs.process.methods
 * 
 * Processes a file's source.  Adds created [documentjs.process.docObject docObjects] to docMap.
 * 
 * @signature `documentjs.process.file(source, docMap, [filename])`
 * 
 * Processes a file's source and calls [documentjs.process.codeAndComment] accordingly. If
 * the file ends with `.js`, each comment will be processed individually.  Otherwise,
 * it treats the entire source as one big comment.
 * 
 * 
 * @param {String} source A files source
 * @param {documentjs.process.docMap} docMap A map of the name of each DocObject to the DocObject
 * 
 * @param {String} [filename] The filename.  If a filename is not provided, 
 * the entire file is treated as one big comment block.  If a filename is provided
 * and is not a .md or .markdown file, it is assumed to be a source file.
 * 
 * @body
 * 
 * ## Use
 * 
 *     var docMap = {}; 
 *     documentjs.process.file("import $ from 'jquery' ... ",
 *          docMap,
 *          "myproject.js");
 * 
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
		comment;
		
	// A callback that gets called with the docObject created and the scope
	function typeCreateHandler(docObject, newScope) {
		
		docObject && addDocObjectToDocMap(docObject, docMap, filename, comment && comment.line);
		if (newScope) {
			scope = newScope;
		}
	};
	
	if (!filename || /\.(md|markdown)$/.test(filename) ) {

		processComment({
			comment: source,
			docMap: docMap,
			scope: scope,
			docObject: {
				type: 'page',
				name: (filename+"").match(/([^\/]+)\.(md|markdown)$/)[1]
			},
			tags: tags
		}, typeCreateHandler);

		return;
	} else {
		comments = getComments(source);
		//clean comments
		for (var i = 0; i < comments.length; i++) {
			comment = comments[i];

			//var start = new Date;
			processCodeAndComment({
				code: comment.code,
				comment: comment.comment,
				docMap: docMap,
				scope: scope,
				tags: tags
			}, typeCreateHandler);
		}
	}
};
var splitter = new RegExp("(?:/\\*+((?:[^*]|(?:\\*+[^*/]))*)\\*+/\[^\\w\\{\\(\\[\"'\$]*([^\\r\\n]*))");
var group = new RegExp("(?:/\\*(?:[^*]|(?:\\*+[^*/]))*\\*+/\[^\\w\\{\\(\\}\\[/]*[^\\n]*)", "g");
var ignoreCheck = new RegExp("@"+"documentjs-ignore");
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

