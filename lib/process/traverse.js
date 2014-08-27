var traverse;
module.exports = traverse = function(object, visitor, stack) {
    var key, child;

    if (visitor.call(null, object, stack) === false) {
        return;
    }
    if(!stack) {
		stack = [];
    }
    stack = stack.concat([object]);
    
    for (key in object) {
        if (object.hasOwnProperty(key)) {
            child = object[key];
            if (typeof child === 'object' && child !== null) {
                traverse(child, visitor, stack);
            }
        }
    }
};