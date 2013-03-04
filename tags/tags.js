
steal("./alias",
"./author",
"./body.js",
"./codeend",
"./codestart",
"./constructor",
"./demo",
"./description",
"./download",
"./hide",
"./iframe",
"./inherits",
"./page",
"./param",
"./parent",
"./plugin",
"./return",
"./scope",
"./signature.js",
"./tag",
"./option.js",
"./test",
"./type",
"./release",
"./image",
function(alias, author, body, codeend, codestart, constructor, demo, description, download,
	hide, iframe, inherits, page, param, parent, plugin, ret, scope, 
	signature, tag, option, test, type,
	release, image) {
	return {
		alias: alias,
		author: author,
		body: body,
		codeend: codeend,
		codestart: codestart,
		constructor: constructor,
		demo: demo,
		description: description,
		download: download,
		hide: hide,
		iframe: iframe,
		inherits: inherits,
		page: page,
		param: param,
		parent: parent,
		plugin: plugin,
		release: release,
		"return": ret,
		scope: scope,
		signature: signature,
		tag: tag,
		option: option,
		test: test,
		type: type,
		image: image
	}
	
	/**
	 * @attribute DocumentJS.tags
	 * @parent DocumentJS
	 * A tag adds additional information to the comment being processed.
	 * For example, if you want the current comment to include the author,
	 * include an @@author tag.
	 * 
	 * ## Creating your own tag
	 * 
	 * To create a tag, you need to add to DocumentJS.tags an object with an add and an optional
	 * addMore method like:
	 * 
	 * @codestart
	 * DocumentJS.tags.mytag = {
	 *   add : function(line){ ... },
	 *   addMore : function(line, last){ ... }
	 * }
	 * @codeend 
	 */

})
