DocumentJS.Tags.demo = {
    add: function(line){
        var m = line.match(/^\s*@demo\s*([\w\.\/]*)\s*([\w]*)/)
        if(m){			
            var src = m[1] ? m[1].toLowerCase() : '';
			this.comment += "<div class='demo_wrapper' data-demo-src='" + src + "'></div>";
        }
    }
};