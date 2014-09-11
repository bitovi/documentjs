var path = require("path"),
	generate = require("../lib/generate/generate"),
	glob = require("glob");


generate({
	pattern: "{lib,doc,tags}/**/*.+(js|md)",
	cwd: path.join(__dirname,"..")
},{
	out: path.join(__dirname,"..","out"),
	parent: "DocumentJS",
	forceBuild: true
});


/*
var g =  new glob.Glob(, {
 	cwd: path.join(__dirname,"..")
});
console.log(g.minimatch.makeRe())

g.on("match",function(src){

	console.log("FIND:",src);
	
});*/

map.bind("change").map(function(e){ e.which}).log("property changed: ");

control.on("mousedown").onValue(function(){ 
	this.on("mousemove").takeUntil( this.on("mouseup")).log("dragging") ) );
});

c1 = can.compute(), 
c2 = can.compute(); 

c1.bind().toCompute(c2); 
c2.bind().toCompute(c1);
