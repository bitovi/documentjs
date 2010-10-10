/**
 * @class DocumentJS.Tags.demo
 * @tag documentation
 * @parent DocumentJS.Tags 
 * 
 * Placeholder for an application demo, e.g. @demo jquery/event/default/default.html.
 * 
 * ###Demo Example:
 *   
 * @demo jquery/controller/controller.html
 */
DocumentJS.Tags.demo = {
    add: function(line){
        var m = line.match(/^\s*@demo\s*([\w\.\/\-]*)\s*([\w]*)/)
        if(m){			
            var src = m[1] ? m[1].toLowerCase() : '';
			this.comment += "<div class='demo_wrapper' data-demo-src='" + src + "'></div>";
        }
    }
};