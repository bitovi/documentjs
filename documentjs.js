if(steal.overwrite){
	load('steal/rhino/steal.js');
}else{
	steal.send = steal;
}
steal( '//steal/generate/ejs', //this is gone too now TODO FIX
	  '//documentjs/json',
	  '//documentjs/baseclass',
	  '//documentjs/showdown')
  .then(function($){
	//We'll document this later
	DocumentJS = function(){};
	
	var extend = steal.extend;
	extend(DocumentJS, steal)
	DocumentJS.EJS = steal.EJS;
	DocumentJS.JSONparse = JSONparse;
	DocumentJS.toJSON = toJSON;
	DocumentJS.extend=  extend;
	DocumentJS.converter = new Showdown.converter();
	delete Showdown;
	DocumentJS.Class = $.Class;
	DocumentJS.Class.serialize = function(){
		this.serializeable =  DocumentJS.makeArray(arguments)
	}
	DocumentJS.Class.prototype.serialize = function(){
		var ob = {}, serials = this.Class.serializeable;
		for(var i=0; i < serials.length; i++){
			var attr, asAttr;
			if(typeof serials[i] == "object"){
				attr = serials[i][0]
				asAttr =serials[i][1]
			}else{
				attr = asAttr = serials[i]
			}
			if(this[attr] !== undefined){
				ob[asAttr] =  (typeof this[attr] == 'function' ? this[attr]() : this[attr] )
				//print(typeof ob[serials[i]])
			}
				
		}

		return ob;
	}
	delete JSONparse;

    delete toJSON;
	

})
.then(	'//documentjs/distance',	
		'//documentjs/application',
		'//documentjs/tags/tags',
		'//documentjs/types/types')