(function(){
	var waiting = {}
	
	DocumentJS.Tags.parent = {
	    add: function(line){
			var m = line.match(/^\s*@parent\s*([\w\.\/]*)\s*([\w]*)/)
			var name = m[1],
				Class =  DocumentJS.Page,
				inst = DocumentJS.Application.objects[name]
	        
			if(!inst){
				inst = DocumentJS.Application.objects[name] = {
					name: name
				}
			}
			if(!this.parents){
				this.parents = [];
			}
			this.parents.push(inst.name);
			
			if(!inst.children){
				inst.children = [];
			}
			inst.children.push(this.name)
	    }
	};
	
})();

