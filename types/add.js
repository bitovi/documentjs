DocumentJS.Type("add",{
	code : function(){
		
	},
	init : function(props){
		if(!DocumentJS.Application.objects[props.name]){
			DocumentJS.Application.objects[props.name] = props;
		}
		return DocumentJS.Application.objects[props.name];
	},
	parent : /script/,
	useName : true,
	hasChildren : true
})