//steal.plugins('view','lang/class','lang/json');
//_args = ["documentjs/test/test.html"]; load('documentjs/documentjs.js')

(function(){
	//we want everything under DocumentJS
	DocumentJS = function(){};
	load('steal/rhino/steal.js')
	load('steal/file/file.js')
	load('steal/ejs/ejs.js')
	load('steal/json/json.js')
	load('steal/class/class.js')
	load('steal/loader/loader.js')
	//var steal = steal;
	
	var Loader = steal.Loader;
	
	var extend = steal.extend;
	extend(DocumentJS, steal)
	DocumentJS.EJS = EJS;
	DocumentJS.JSONparse = JSONparse;
	DocumentJS.toJSON = toJSON;
	DocumentJS.distance =function  (s1, s2) {
	    if (s1 == s2) {
	        return 0;
	    }
	    var s1_len = s1.length,
			s2_len = s2.length;
	    if (s1_len === 0) {
	        return s2_len;
	    }
	    if (s2_len === 0) {
	        return s1_len;
	    }
	 
        s1 = s1.split('');
        s2 = s2.split('');
	    
	 
	    var v0 = new Array(s1_len+1),
			v1 = new Array(s1_len+1),
			s1_idx=0, 
			s2_idx=0, 
			cost=0;
	    for (s1_idx=0; s1_idx<s1_len+1; s1_idx++) {
	        v0[s1_idx] = s1_idx;
	    }
	    var char_s1='', 
			char_s2='';
	    for (s2_idx=1; s2_idx<=s2_len; s2_idx++) {
	        v1[0] = s2_idx;
	        char_s2 = s2[s2_idx - 1];
	 
	        for (s1_idx=0; s1_idx<s1_len;s1_idx++) {
	            char_s1 = s1[s1_idx];
	            cost = (char_s1 == char_s2) ? 0 : 1;
	            var m_min = v0[s1_idx+1] + 1;
	            var b = v1[s1_idx] + 1;
	            var c = v0[s1_idx] + cost;
	            if (b < m_min) {
	                m_min = b; }
	            if (c < m_min) {
	                m_min = c; }
	            v1[s1_idx+1] = m_min;
	        }
	        var v_tmp = v0;
	        v0 = v1;
	        v1 = v_tmp;
	    }
	    return v0[s1_len];
	}

	
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
	delete steal;
	delete EJS;
    delete toJSON;
	
	
	load(
	    'documentjs/application.js',
	    'documentjs/pair.js' ,
	    'documentjs/directives.js',
	    'documentjs/function.js',
	    'documentjs/class.js',
	    'documentjs/constructor.js',
	    'documentjs/file.js',
	    'documentjs/add.js',
	    'documentjs/static.js',
	    'documentjs/prototype.js',
	    'documentjs/attribute.js',
	    'documentjs/page.js'
	)
	
	var loader = new Loader(_args[0]);
	var total = [];
	loader.each(null, function(script, content, i){
		if(content && script.src)
			total.push({src: content, path: script.src})
	})
	var app = new DocumentJS.Application(total, "documentjs/test");

	
	app.generate(_args[0].replace(/[^\/]*$/, "docs") ) //"documentjs/test/docs");
	
})();








