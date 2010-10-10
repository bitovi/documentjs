/**
 * @class DocumentJS.Tags.hide
 * @tag documentation
 * @parent DocumentJS.Tags 
 * 
 * Hides this class or constructor from the left hand side bar.
 */
DocumentJS.Tags.hide ={
    add: function(line){
        var m = line.match(/^\s*@hide/)
        if(m){
            this.hide = true;
        }
    }
};