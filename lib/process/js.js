var esprima = require("esprima"),
	traverse = require("./traverse"),
	comparify = require("comparify");


var blockComments = function(sourceComments){
	var comments = [];
	sourceComments.forEach(function(comment){
		if(comment.type === "Block" && comment.value[0] === "*") {
			comments.push(comment);
		}
	});
	return comments;
};
var sameComment = function(c1, c2){
	return c1.range[0] === c2.range[0] &&
		c1.range[1] === c2.range[1];
};


module.exports = function(source, filename){
	
	var result = esprima.parse(source,{comment: true, attachComment: true});
	
	var comments = blockComments(result.comments);

	traverse(result, function(obj, stack){
		
		if(obj.leadingComments && obj.leadingComments.length) {
			var leading = blockComments(obj.leadingComments),
				cur;
			// take comments out 
			while( leading.length > 1 ) {
				var comment = comments.shift();
				if( !sameComment(leading[0], comment) ) {
					processComment(comment);
				} else {
					processComment(leading.shift());
				}
			}
			comments.shift();
			processComment(leading.shift(), stack);
		}
	});
	comments.forEach(function(comment){
		processComment(comment);
	});
};
var processComment = function(comment, stack){
	console.log("comment",comment,"\n",stack && stack.length)
};

// keep taking leading comments and processing

// no parent ... what about "late" parents
var isExports = function(obj){
	return comparify(obj,{
		"type": "AssignmentExpression",
		"operator" : "=",
		left: {
			"type": "MemberExpression",
	        "computed": false,
	        "object": {
	            "type": "Identifier",
	            "name": "exports"
	        }
		}
	});
};


makeExports = function(){
	return {
		name: name(parent,"#",obj.left.property)
	};
};

addExports = function(parent,what){
	if(!parent.exports){
		parent.exports = [];
	} 
	parent.exports.push(what);
};

// go through code ... find leadingComments / trailing
// process up to that point