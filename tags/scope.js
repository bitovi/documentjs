/**
 * @class DocumentJS.Tags.scope
 * @tag documentation
 * @parent DocumentJS.Tags 
 * 
 * Forces the current type to start scope. 
 */
DocumentJS.Tags.scope = {
    add: function(line){
		print("Scope! "+line)
        this.starts_scope = true;
    }
};