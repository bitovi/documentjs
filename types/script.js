
/**
 * Represents a file.
 * Breaks up file into comment and code parts.
 * Creates new [DocumentJS.Pair | Doc.Pairs].
 * @hide
 */
DocumentJS.Script = 
{
    group : new RegExp("(?:/\\*(?:[^*]|(?:\\*+[^*/]))*\\*+/\[^\\w\\{\\(\\[/]*[^\\n]*)", "g"),
    
    splitter : new RegExp("(?:/\\*+((?:[^*]|(?:\\*+[^*/]))*)\\*+/\[^\\w\\{\\(\\[\"'\$]*([^\\r\\n]*))"),

    /**
     * Generates docs for a file.
     * @param {Object} inc an object that has path and text attributes
     */
    process : function(inc, objects){
		
		
		var source = inc.src
		//check if the source has @documentjs-ignore
		if(/\@documentjs-ignore/.test(source)){
			return;
		}
        var script = {
			type: "script",
			name: inc.path
		}
		objects[script.name] = script;
		var pairs = source.match(this.group);
        //clean comments
        var scope = script;
        if(!pairs) return;
        for(var i = 0; i < pairs.length ; i ++){
            var splits = pairs[i].match(this.splitter),
				comment = splits[1].replace(/^[^\w@]*/,'').replace(/\r?\n(\s*\*+)?/g,'\n'),
				code = splits[2];
			var type = DocumentJS.Type.create( comment , code, scope, objects);
			
            if(type){
				
				objects[type.name] = type;
				//get the new scope if you need it
				// if we don't have a type, assume we can have children
				scope = !type.type || DocumentJS.Type.types[type.type].hasChildren ? type : scope;
			}
                
        }
		
    }
};

DocumentJS.Type("script",{
	useName : false,
	hasChildren : true
})