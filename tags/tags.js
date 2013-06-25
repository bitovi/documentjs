
steal(
"./add.js",	
"./alias",
"./api.js",
"./author",
"./body.js",
"./codeend",
"./codestart",
"./constructor.js",
"./demo",
"./description",
"./download",
"./function.js",
"./hide",
"./iframe",
"./image",
"./inherits",
"./module.js",
"./option.js",
"./page",
"./param",
"./parent",
"./plugin",
"./property.js",
"./prototype.js",
"./release.js",
"./return",
"./signature.js",
"./static.js",
"./tag",
"./test",
"./this.js",
"./typedef.js",
"./group.js",
function(add, alias, api, author, body, codeend, codestart, constructor, demo, description, download,
	func,
	hide, iframe, image, inherits, mod, option,  page, param, parent, plugin, property, prototype, 
	release, ret, 
	signature, statc, tag, test, that, typedef, group) {
	return {
		add: add,
		alias: alias,
		api: api,
		author: author,
		body: body,
		codeend: codeend,
		codestart: codestart,
		constructor: constructor,
		demo: demo,
		description: description,
		download: download,
		"function": func,
		hide: hide,
		iframe: iframe,
		image: image,
		inherits: inherits,
		"module": mod,
		option: option,
		page: page,
		param: param,
		parent: parent,
		plugin: plugin,
		property: property,
		"prototype" : prototype,
		release: release,
		"return": ret,
		signature: signature,
		"static": statc,
		tag: tag,
		test: test,
		"this": that,
		typedef: typedef,
		group: group
	}
	
	/**
	 * @property {Object} DocumentJS.tags
	 * @parent DocumentJS 0
	 * A tag adds additional information to the comment being processed.
	 * For example, if you want the current comment to include the author,
	 * include an `@@author` tag.
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
