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
DocumentJS.Pair.extend('DocumentJS.Attribute',
/* @static */
{
	init : function(){
        this.add(DocumentJS.Directive.Return, DocumentJS.Directive.Param, DocumentJS.Directive.CodeStart, 
        DocumentJS.Directive.CodeEnd,DocumentJS.Directive.Plugin, DocumentJS.Directive.Hide, 
        DocumentJS.Directive.Tag, DocumentJS.Directive.iFrame, DocumentJS.Directive.Demo,
		DocumentJS.Directive.Parent, DocumentJS.Directive.Type, DocumentJS.Directive.Download,
		DocumentJS.Directive.Test);
        this._super();
				
		this.serialize('plugin',['full_name','name'], 'html', 'shortName', 'ret','params',
			 ['real_comment','comment'],'download','test')
	},

     /**
      * Matches an attribute with code
      * @param {Object} code
      */
     code_match: function(code){
         return code.match(/(\w+)\s*[:=]\s*/) && !code.match(/(\w+)\s*[:=]\s*function\(([^\)]*)/)  
     }
 },
 /* @prototype */
{
     /**
      * Saves the name of the attribute
      */
     code_setup: function(){
        var parts = this.code.match(/(\w+)\s*[:=]\s*/);
        this.name = parts[1];

     },
     attribute_add: function(line){
        var m = line.match(/^@\w+ ([^\s]+)/)
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
 