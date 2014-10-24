var processComment = require("./comment"),
	processCodeAndComment = require("./code_and_comment"),
	tags = require("../tags/tags"),
	addDocObjectToDocMap = require("./add_doc_object_to_doc_map"),
	_ = require('lodash'),
	getComments = require("./get_comments");

var ignoreCheck = new RegExp("@"+"documentjs-ignore");
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
	} else if( /\.(mustache|handlebars)$/.test(filename) ) {
		typeCreateHandler({
			name: (filename+"").match(/([^\/]+)\.(mustache|handlebars)$/)[1],
			renderer: function(data, originalRenderer){
				var contentRenderer = originalRenderer.Handlebars.compile(source);
				var content = contentRenderer(data);
				// pass that content to the layout
				return originalRenderer.layout(_.extend({
					content: content
				}, data));
			},
			type: "template"
		});
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


