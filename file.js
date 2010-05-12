
/**
 * Represents a file.
 * Breaks up file into comment and code parts.
 * Creates new [DocumentJS.Pair | Doc.Pairs].
 * @hide
 */
DocumentJS.Pair.extend('DocumentJS.Script',
{
    group : new RegExp("(?:/\\*(?:[^*]|(?:\\*+[^*/]))*\\*+/\[^\\w\\{\\(\\[/]*[^\\n]*)", "g"),
    
    splitter : new RegExp("(?:/\\*+((?:[^*]|(?:\\*+[^*/]))*)\\*+/\[^\\w\\{\\(\\[\"'\$]*([^\\r\\n]*))")
},{
    /**
     * Generates docs for a file.
     * @param {Object} inc an object that has path and text attributes
     */
    init : function(inc){
		this.children = [];
		this.name = inc.path;
        this.src=inc.src;
		//check if the source has @documentjs-ignore
		if(!/\@documentjs-ignore/.test(this.src)){
			this.generate();
		}
        
    },
    generate : function(){
        var pairs = this.src.match(this.Class.group);
        //clean comments
        var scope = this;
        if(!pairs) return;
        for(var i = 0; i < pairs.length ; i ++){
            var splits = pairs[i].match(this.Class.splitter);
            var comment = splits[1].replace(/^[^\w@]*/,'').replace(/\r?\n(\s*\*+)?/g,'\n');
            var code = splits[2];
			var pair = DocumentJS.Pair.create( comment , code, scope);
            if(pair){
				//get the new scope if you need it
				scope = pair.scope();
			}
                
        }
    },
    /**
     * Removes comment text from a comment. 
     * @param {Object} comment
     */
    clean_comment : function(comment){
        return comment.replace(/\/\*|\*\//,'').replace(/\r?\n\s*\*?\s*/g,'\n')
    },
    full_name: function(){
        return "";
    }
});