steal.then(function(){
/**
 * @class DocumentJS.Tags.alias
 * @tag documentation
 * @parent DocumentJS.Tags 
 * The Class or Constructor is known by another name.
 * 
 * ###Example:
 *  
 * @codestart
 * /*
 *  * @alias WidgetFactory
 *  *|
 *  $.Class.extend("jQuery.Controller",
 *  ...
 * @codeend 
 */
DocumentJS.Tags.alias= {
    add: function(line){
        var m = line.match(/^\s*@alias\s*([\w\-\.]*)/)
        if(m){
            this.alias = m[1];
        }
    }
};
})