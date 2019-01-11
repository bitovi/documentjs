var $ = require("jquery");
var ContentList = require("./content_list");
var FrameHelper = require("./frame_helper");
var Versions = require("./versions");
require("./styles/styles.less!");
require("./prettify");

var codes = document.getElementsByTagName("code");
for(var i = 0; i < codes.length; i ++){
	var code = codes[i];
	if(code.parentNode.nodeName.toUpperCase() === "PRE"){
		code.className = code.className +" prettyprint";
	}
}
prettyPrint();

new ContentList(".contents");
new FrameHelper(".docs");
new Versions( $("#versions, .sidebar-title:first")[0] );
