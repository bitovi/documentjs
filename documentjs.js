if ( steal.overwrite ) {
	load('steal/rhino/steal.js');
} else {
	//what steal should send to functions.  This says send steal instead of jQuery.
	steal.send = steal;
}

steal(	'//steal/generate/ejs',
		'//documentjs/json', 
		'//documentjs/showdown')
.then( function( $ ) {
	//if we already have DocumentJS, don't create another, this is so we can document documentjs
	if(typeof DocumentJS != 'undefined'){
		return;
	}
	
	/**
	 * @class DocumentJS
	 * @tag core, documentation
	 * DocumentJS provides powerful and easy to extend documentation functionality.
	 * It's smart enough to guess 
	 * at things like function names and parameters, but powerful enough to generate 
	 * <span class='highlight'>JavaScriptMVC's entire website</span>!
	 * 
	 * DocumentJS is pure JavaScript so it is easy to modify and make improvements.  First, lets show what
	 * [DocumentJS.Type | types] DocumentJS can document:
	 * 
	 * * [DocumentJS.Type.types.page | @page] -  a standalone page.
	 * * [DocumentJS.Type.types.attribute | @attribute] -  values on an object.
	 * * [DocumentJS.Type.types.function | @function] - functions on an object.
	 * * [DocumentJS.tags.constructor | @constructor] - functions you call like: new Thing()
	 * * [DocumentJS.Type.types.class| @class] - normal JS Objects and source that uses [jQuery.Class]
	 *
	 * You can also specifify where your functions and attributes are being added with:
	 * 
	 * * [DocumentJS.Type.types.prototype | @prototype] - add to the previous class or constructor's prototype functions
	 * * [DocumentJS.Type.types.static | @static] - add to the previous class or constructor's static functions
	 * * [DocumentJS.Type.types.add |@add] - add docs to a class or construtor described in another file
	 * 
	 * Finally, you have [DocumentJS.tags|tags] that provide addtional info about the comment:
	 * 
	 * * [DocumentJS.tags.alias|@alias] - another commonly used name for Class or Constructor
	 * * [DocumentJS.tags.author|@author] - author of class
	 * * [DocumentJS.tags.codestart|@codestart] -> [DocumentJS.tags.codeend|@codeend] - insert highlighted code block
	 * * [DocumentJS.tags.demo|@demo] - placeholder for an application demo
	 * * [DocumentJS.tags.download|@download] - adds a download link
	 * * [DocumentJS.tags.iframe|@iframe] - adds an iframe to some page with example code
	 * * [DocumentJS.tags.hide|@hide] - hide in Class view
	 * * [DocumentJS.tags.inherits|@inherits] - what the Class or Constructor inherits
	 * * [DocumentJS.tags.parent|@parent] - says under which parent the current type should be located 
	 * * [DocumentJS.tags.param|@param] - A function's parameter
	 * * [DocumentJS.tags.plugin|@plugin] - by which plugin this object gets steald
	 * * [DocumentJS.tags.return|@return] - what a function returns
	 * * [DocumentJS.tags.scope|@scope] - forces the current type to start scope
	 * * [DocumentJS.tags.tag|@tag] - tags for searching
	 * * [DocumentJS.tags.test|@test] - link for test cases
	 * * [DocumentJS.tags.type|@type] - sets the type for the current commented code
	 * * [DocumentJS.tags.image|@image] - adds an image
	 * 
	 * ### Example
	 * 
	 * The following documents a Person constructor.
	 * @codestart
	 * /* @constructor
	 *  * Person represents a human with a name.  Read about the 
	 *  * animal class [Animal | here].
	 *  * @init 
	 *  * You must pass in a name.
	 *  * @params {String} name A person's name
	 *  *|
	 * Person = function(name){
	 *    this.name = name
	 *    Person.count ++;
	 * }
	 * /* @Static *|
	 * steal.Object.extend(Person, {
	 *    /* Number of People *|
	 *    count: 0
	 * })
	 * /* @Prototype *|
	 * Person.prototype = {
	 *   /* Returns a formal name 
	 *    * @return {String} the name with "Mrs." added
	 *    *|
	 *   fancy_name : function(){
	 *      return "Mrs. "+this.name;
	 *   }
	 * }
	 * @codeend
	 * 
	 * There are a few things to notice:
	 * 
	 * * The example closes comments with _*|_.  You should close them with / instead of |.
	 * * We create a link to another class with _[Animal | here]_.
	 * 
	 * ###Using with a JavaScritpMVC application
	 * 
	 * You just have to run the docs script in your apps scripts folder:
	 * 
	 * @codestart
	 *     js _APPNAME_/scripts/docs.js
	 * @codeend
	 * 
	 * Open _APPNAME_/docs.html to see your documentation.
	 * 
	 * ###Using without JavaScriptMVC
	 * 
	 * Coming soon!
	 * 
	 * ###Inspiration
	 * 
	 * DocumentJS was inspired by the [http://api.jquery.com/ jQuery API Browser] by [http://remysharp.com/ Remy Sharp]
	 * 
	 * 
	 * @param {Array|String} scripts an array of script objects that have src and text properties like:
	 * @codestart
	 * [{src: "path/to/file.js", text: "var a= 1;"}, { ... }]
	 * @codeend
	 * @param {Object} options an options hash including
	 * 
	 *   . name - the name of the application
	 *   . out - where to generate the documentation files
	 */
	DocumentJS = function(scripts, options) {
		// an html file, a js file or a directory
		options = options || {};
		if(typeof scripts == 'string'){
			if(!options.out){
				if(/\.html?$|\.js$/.test(scripts)){
					options.out = scripts.replace(/[^\/]*$/, 'docs')
				}else{ //folder
					options.out = scripts+"/docs";
				}
			}

			scripts = DocumentJS.getScripts(scripts)
		}
		
 		//all the objects live here, have a unique name
		DocumentJS.objects = {};
		
		//create each Script, which will create each class/constructor, etc
		print("PROCESSING SCRIPTS\n")
		for ( var s = 0; s < scripts.length; s++ ) {
			DocumentJS.Script.process(scripts[s])
		}
		print('\nGENERATING DOCS -> '+options.out+'\n')
		
		// generate individual JSONP forms of individual comments
		DocumentJS.generate(options)

		// make combined search data
		DocumentJS.searchData(options )

		//make summary page (html page to load it all)
		DocumentJS.summaryPage(options);
		
	};
	var extend = steal.extend,
		build = steal.build,
		docJS = DocumentJS;
	
	extend(docJS, {
		// gets scripts from a path
		getScripts : function(file){
			var scripts = [];
			if (/\.html?$/.test(file)) { // load all the page's scripts

				steal.plugins('steal/build', function(steal){

					steal.build.open(file).each(function(script, text, i){
						if (text && script.src) {
							scripts.push({
								src: script.src,
								text:  text
							})
						}
					});
				});
			}
			else if (/\.js$/.test(file)) { // load just this file
				scripts.push(file)
			}
			else { // assume its a directory
				var getJSFiles = function(dir){
				  new steal.File(dir).contents(function(f, type){
					if(type == 'directory'){
				       getJSFiles(dir+"/"+f)
				    }else if(/\.js$/.test(f)){

					  scripts.push( (dir+"/"+f).replace('\\', '/') )
				    }
				  })
				};
				getJSFiles(file);
			}
					
			return scripts;
		},
		generate : function(options){

			// go through all the objects and generate their docs
			var output = options.out ? options.out+ "/" : "";

			for ( var name in docJS.objects ) {
				if (docJS.objects.hasOwnProperty(name)){
					//get a copy of the object (we will modify it with children)
					var obj = docJS.extend({}, docJS.objects[name]),
						toJSON;
					
					// eventually have an option allow scripts
					if ( obj.type == 'script' || typeof obj != "object" ) {
						continue;
					}
					//get all children
					
					obj.children = this.listedChildren(obj);
	
					var converted = name.replace(/ /g, "_")
										.replace(/&#46;/g, ".")
										.replace(/&gt;/g, "_gt_")
										.replace(/\*/g, "_star_")
					toJSON = this.out(obj);
					new docJS.File(output + converted + ".json").save(toJSON);
				}
	
			}
		},
		// takes an object and returns how DocumentJS likes to save data
		out: function() {
			return "C(" + docJS.toJSON.apply(docJS.toJSON, arguments) + ")"
		},
		// tests if item is a shallow child of parent
		shallowParent: function( item, parent ) {
			if ( item.parents && parent ) {
				for ( var i = 0; i < item.parents.length; i++ ) {
					if ( item.parents[i] == parent.name ) {
						return true;
					}
				}
			}
			return false;
		},
		// returns all recustive 'hard' children and one level of 'soft' children.
		listedChildren: function( item, stealSelf, parent ) {
			var result = stealSelf ? [item.name] : [];
			if ( item.children && !this.shallowParent(item, parent) ) {
				for ( var c = 0; c < item.children.length; c++ ) {
					var child = docJS.objects[item.children[c]];
					var adds = this.listedChildren(child, true, item);
					if ( adds ) {
						result = result.concat(adds);
					}

				}
			}
			return result;
		},
		summaryPage: function( options ) {
			//find index page
			var path = options.out,
				base = path.replace(/[^\/]*$/, ""),
				renderData = {
					pathToRoot: new docJS.File(base.replace(/\/[^\/]*$/, "")).pathToRoot(),
					path: path,
					indexPage: docJS.objects.index
				}

			//checks if you have a summary
			if ( readFile(base + "summary.ejs") ) {
				docJS.renderTo(base + "docs.html", base + "summary.ejs", renderData)
			} else {
				print("Using default page layout.  Overwrite by creating: " + base + "summary.ejs");
				docJS.renderTo(base + "docs.html", "documentjs/jmvcdoc/summary.ejs", renderData);
			}
		},
		renderTo: function( file, ejs, data ) {
			new docJS.File(file).save(new docJS.EJS({
				text: readFile(ejs)
			}).render(data));
		}
	})
	//Add things to StealJS we like, then remove them from the global namespace
	
	
	extend(docJS, steal); //even if we delete steal, we still have it's goodness
	DocumentJS.EJS = steal.EJS;
	DocumentJS.JSONparse = JSONparse;
	DocumentJS.toJSON = toJSON;
	DocumentJS.extend = extend;
	
	DocumentJS.converter = new Showdown.converter();
	
	delete Showdown;
	delete JSONparse;


}).then('//documentjs/distance', 
		'//documentjs/searchdata',
		'//documentjs/tags/tags', 
		'//documentjs/types/types');