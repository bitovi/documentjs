// Goes through the graph and figures out the highest parent


var getTopParent = function(docMap, child){
	var parent;
	while( (parent = docMap[child.parent]) && parent !== child) {
		child = parent;
	}
	return child.parent || child.name;
};


module.exports = function(docMap){
	var heightMap = {};
	var max;
	for(var name in docMap) {
		if(max === undefined) {
			max = name;
			heightMap[name] = 0;
		}
		var top = getTopParent(docMap, docMap[name]);
		heightMap[top] = (heightMap[top] || 0)+1;
		if(heightMap[top] > heightMap[max] ) {
			max = top;
		}
	}
	return max;
};
