/**
 * @hide
 * Documents an attribute.  Example:
 * @codestart
 * steal.Object.extend(Person, {
 *    /* Number of People *|
 *    count: 0
 * })
 * @codeend
 */
DocumentJS.Pair.extend('DocumentJS.Attribute',{
	init : function(){
		this.serialize('plugin','full_name','shortName',['real_comment','comment'])
	}
},
 /* @prototype */
 {
     /**
      * Matches an attribute with code
      * @param {Object} code
      */
     code_match: function(code){
         return code.match(/(\w+)\s*[:=]\s*/) && !code.match(/(\w+)\s*[:=]\s*function\(([^\)]*)/)  
     },
     init : function(){
        this.add(
                DocumentJS.Directive.Author,
                DocumentJS.Directive.Return,
                DocumentJS.Directive.Hide, DocumentJS.Directive.CodeStart, DocumentJS.Directive.CodeEnd, DocumentJS.Directive.Alias,
                DocumentJS.Directive.Plugin, DocumentJS.Directive.Tag);
        this._super();
     }
 },{
     /**
      * Saves the name of the attribute
      */
     code_setup: function(){
        var parts = this.code.match(/(\w+)\s*[:=]\s*/);
        this.name = parts[1];
     },
     attribute_add: function(line){
        var m = line.match(/^@\w+ ([\w\.]+)/)
        if(m){
            this.name = m[1];
        }
     },
    toFile : function(name){
        try{
            var res = this.jsonp();
            new steal.File('apps/'+name+'/docs/'+this.full_name()+".json").save(res);
            
        }catch(e ){
            print("Unable to generate class for "+this.full_name()+" !")
            print("  Error: "+e)
        }
    }
 });
 