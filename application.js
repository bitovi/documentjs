steal.then(function() {
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
	 * * [DocumentJS.Tags.constructor | @constructor] - functions you call like: new Thing()
	 * * [DocumentJS.Type.types.class| @class] - normal JS Objects and source that uses [jQuery.Class]
	 *
	 * You can also specifify where your functions and attributes are being added with:
	 * 
	 * * [DocumentJS.Type.types.prototype | @prototype] - add to the previous class or constructor's prototype functions
	 * * [DocumentJS.Type.types.static | @static] - add to the previous class or constructor's static functions
	 * * [DocumentJS.Type.types.add |@add] - add docs to a class or construtor described in another file
	 * 
	 * Finally, you have [DocumentJS.Tags|tags] that provide addtional info about the comment:
	 * 
	 * * [DocumentJS.Tags.alias|@alias] - another commonly used name for Class or Constructor
	 * * [DocumentJS.Tags.author|@author] - author of class
	 * * [DocumentJS.Tags.codestart|@codestart] -> [DocumentJS.Tags.codeend|@codeend] - insert highlighted code block
	 * * [DocumentJS.Tags.demo|@demo] - placeholder for an application demo
	 * * [DocumentJS.Tags.download|@download] - adds a download link
	 * * [DocumentJS.Tags.iframe|@iframe] - adds an iframe to some page with example code
	 * * [DocumentJS.Tags.hide|@hide] - hide in Class view
	 * * [DocumentJS.Tags.inherits|@inherits] - what the Class or Constructor inherits
	 * * [DocumentJS.Tags.parent|@parent] - says under which parent the current type should be located 
	 * * [DocumentJS.Tags.param|@param] - A function's parameter
	 * * [DocumentJS.Tags.plugin|@plugin] - by which plugin this object gets steald
	 * * [DocumentJS.Tags.return|@return] - what a function returns
	 * * [DocumentJS.Tags.scope|@scope] - forces the current type to start scope
	 * * [DocumentJS.Tags.tag|@tag] - tags for searching
	 * * [DocumentJS.Tags.test|@test] - link for test cases
	 * * [DocumentJS.Tags.type|@type] - sets the type for the current commented code
	 * * [DocumentJS.Tags.image|@image] - adds an image
	 * 
	 * ###Example
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
	 */
	DocumentJS.extend(DocumentJS,
	/* @Static */
	{
		render_to: function( file, ejs, data ) {
			new DocumentJS.File(file).save(new DocumentJS.EJS({
				text: readFile(ejs)
			}).render(data));
			//MVCOptions.save(file,  this.render(ejs, data) );
		},
		render: function( ejs, data ) {
			var v = new DocumentJS.EJS({
				text: readFile(ejs),
				name: ejs
			});
			return v.render(data)
		},
		/**
		 * Replaces content in brackets [] with a link to source.
		 * @param {String} content Any text, usually a commment.
		 */
		link_content: function( content ) {
			return content.replace(/\[\s*([^\|\]\s]*)\s*\|?\s*([^\]]*)\s*\]/g, function( match, first, n ) {
				//need to get last
				//need to remove trailing whitespace
				var url = DocumentJS.objects[first];
				if ( url ) {
					if (!n ) {
						n = first.replace(/\.prototype|\.static/, "")
					}
					return "<a href='" + url + "'>" + n + "</a>"
				} else if ( typeof first == 'string' && first.match(/^https?|www\.|#/) ) {
					return "<a href='" + first + "'>" + (n || first) + "</a>"
				}
				return match;
			})
		},
		/**
		 * Will replace with a link to a class or function if appropriate.
		 * @param {Object} content
		 */
		link: function( content ) {
			var url = DocumentJS.objects[content];
			return url ? "<a href='#&who=" + content + "'>" + content + "</a>" : content;
		},
		/**
		 * A map of the full name of all the objects the application creates and the url to 
		 * the documentation for them.
		 */
		objects: {}
	});

	/**
	 * @constructor
	 * @hide
	 * Creates documentation for an application
	 * @init
	 * Generates documentation from the passed in files.
	 * @param {Array} total An array of path names or objects with a path and text.
	 * @param {Object} app_name The application name.
	 */
	DocumentJS.Application = function( total, app_name ) {

		this.name = app_name;
		this.total = total;
		//this.files = [];
		this.objects = {}; //all the objects live here, have a unique name
		DocumentJS.Application.objects = this.objects;
		//create each Script, which will create each class/constructor, etc
		for ( var s = 0; s < total.length; s++ ) {
			DocumentJS.Script.process(total[s], this.objects)
		}
		//sort class and constructors so they are easy to find
		//this.all_sorted = DocumentJS.Class.listing.concat( DocumentJS.Constructor.listing ).sort( DocumentJS.Pair.sort_by_name )
	}


	DocumentJS.Application.prototype =
	/* @prototype */
	{
		/**
		 * Creates the documentation files.
		 * @param {String} path where to put the docs
		 */
		generate: function( path, convert ) {
			//new steal.File('docs/classes/').mkdirs();
			print("generating ...")


			//go through all the objects
			for ( var name in DocumentJS.Application.objects ) {

				var obj = DocumentJS.extend({}, DocumentJS.Application.objects[name]),
					toJSON;

				if ( obj.type == 'script' || typeof obj != "object" ) {
					continue;
				}
				//get all children
				var children = this.linker(obj);
				obj.children = children;

				var converted = name.replace(/ /g, "_").replace(/&#46;/g, ".").replace(/&gt;/g, "_gt_").replace(/\*/g, "_star_")
				//print("  "+name)
				toJSON = this.toJSON(obj);
				new DocumentJS.File(path + "/" + converted + ".json").save(toJSON);


			}


			this.searchData(path, convert);
			this.summary_page(path, convert)
		},
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
		linker: function( item, stealSelf, parent ) {
			var result = stealSelf ? [item.name] : [];
			if ( item.children && !this.shallowParent(item, parent) ) {
				//print(this.name)
				for ( var c = 0; c < item.children.length; c++ ) {
					var child = DocumentJS.Application.objects[item.children[c]];
					var adds = this.linker(child, true, item);
					if ( adds ) {
						result = result.concat(adds);
					}

				}
			}
			return result;
		},
		/**
		 * Creates a page for all classes and constructors
		 * @param {String} summary the left hand side.
		 */
		summary_page: function( path, convert ) {
			//find index page
			var base = path.replace(/[^\/]*$/, "");
			this.indexPage = DocumentJS.Application.objects.index

			//checks if you have a summary
			if ( readFile(path + "/summary.ejs") ) {
				DocumentJS.render_to(base + "docs.html", path + "/summary.ejs", this)
			} else {
				print("Using default page layout.  Overwrite by creating: " + path + "/summary.ejs");
				DocumentJS.render_to(base + "docs.html", "documentjs/jmvcdoc/summary.ejs", {
					pathToRoot: new DocumentJS.File(base.replace(/\/[^\/]*$/, "")).pathToRoot(),
					path: path
				}); //default 
			}


		},
		indexOf: function( array, item ) {
			var i = 0,
				length = array.length;
			for (; i < length; i++ )
			if ( array[i] === item ) return i;
			return -1;
		},
		addTagToSearchData: function( data, tag, searchData ) {

			var letter, l, depth = 2,
				current = searchData;

			for ( l = 0; l < depth; l++ ) {
				letter = tag.substring(l, l + 1);
				if (!current[letter] ) {
					current[letter] = {};
					current[letter].list = [];
				}
				if ( this.indexOf(current[letter].list, data) == -1 ) current[letter].list.push(data);
				current = current[letter];
			}
		},
		addToSearchData: function( list, searchData ) {
			var c, parts, part, p, fullName;
			for ( var name in list ) {
				c = list[name];
				if ( c.type == 'script' ) {
					continue;
				}
				//break up into parts
				fullName = c.name;
				searchData.list[fullName] = {
					name: c.name,
					type: c.type
				};
				if ( c.title ) {
					searchData.list[fullName].title = c.title
				}
				if ( c.tags ) {
					searchData.list[fullName].tags = c.tags
				}
				if ( c.hide ) {
					searchData.list[fullName].hide = c.hide
				}
				parts = fullName.split(".");
				for ( p = 0; p < parts.length; p++ ) {
					part = parts[p].toLowerCase();
					if ( part == "jquery" ) continue;
					this.addTagToSearchData(fullName, part, searchData)
				}
				//now add tags if there are tags
				if ( c.tags ) {
					for ( var t = 0; t < c.tags.length; t++ )
					this.addTagToSearchData(fullName, c.tags[t], searchData);
				}

			}
		},
		searchData: function( path, convert ) {
			//var sortedClasses = DocumentJS.Class.listing.sort( DocumentJS.Pair.sort_by_name )
			//go through and create 2 level hash structure
			var searchData = {
				list: {}
			};


			this.addToSearchData(DocumentJS.Application.objects, searchData)

/*
        
        
        this.addToSearchData(sortedClasses, searchData)
        this.addToSearchData(DocumentJS.Function.listing, searchData)
        this.addToSearchData(DocumentJS.Constructor.listing, searchData)
		this.addToSearchData(DocumentJS.Static.listing, searchData)
		this.addToSearchData(DocumentJS.Prototype.listing, searchData)
		this.addToSearchData(DocumentJS.Page.listing, searchData)
        this.addToSearchData(DocumentJS.Attribute.listing, searchData)*/


			new DocumentJS.File(path + "/searchData.json").save(this.toJSON(searchData, false));

			//new DocumentJS.File(this.name+"/docs/searchData.json").save("C("+DocumentJS.toJSON(searchData, false)+")");
		},
		toJSON: function() {
			return "C(" + DocumentJS.toJSON.apply(DocumentJS.toJSON, arguments) + ")"
		},
		/**
		 * Only shows five folders in a path.
		 * @param {String} path a file path to convert
		 * @return {String}
		 */
		clean_path: function( path ) {
			return path;
			var parts = path.split("/")
			if ( parts.length > 5 ) parts = parts.slice(parts.length - 5);
			return parts.join("/");
		}
	}
})