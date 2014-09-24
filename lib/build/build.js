/**
 * @property {{}} documentjs.build build
 * @parent DocumentJS.apis.customize
 * 
 * @group documentjs.build.methods 0 methods
 * @group documentjs.build.types 1 types
 * @group documentjs.build.defaultHelpers 2 default helpers
 * 
 * A collection of helpers used to build and compile the templates
 * used to render each [documentjs.process.docObject docObject] into
 * HTML and build the static JS and CSS used by that HTML.
 * 
 * @body
 * 
 * ## Use
 * 
 *     var documentjs = require("documentjs");
 *     documentjs.process.file(...)
 */

exports.renderer = require("./renderer");
exports.staticDist = require("./static_dist");
exports.templates = require("./templates");