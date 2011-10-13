// js documentjs/jmvcdoc/toHTML/convert.js path=jmvc\docs docsLoc=docs commentsLoc=http://jmvc.disqus.com/embed.js analyticsAct=UA-2302003-4 analyticsDomain=javascriptmvc.com
load('steal/rhino/steal.js')
load('steal/rhino/prompt.js')

var args = steal.handleArgs(_args, ["path", "docsLoc", "commentsLoc", "analyticsAct", "analyticsDomain", "jmvcRoot"])

var jmvcRoot;

if (!args.path ) {
	print("Please pass the docs directory into the script");
	quit();
}

if (!args.docsLoc ) {
	args.docsLoc = args.path + "/docs";
	args.docsLoc = args.docsLoc.replace("\\", "/");
}

// cookbook/test/docs --> ../../..
if (!args.jmvcRoot ) {
	var nbrDirs = args.docsLoc.split("/").length,
		jmvcRootArr = [];
	for ( var i = 0; i < nbrDirs; i++ ) {
		jmvcRootArr.push('..')
	}
	jmvcRoot = jmvcRootArr.join("/") + "/"
} else {
	jmvcRoot = args.jmvcRoot;
}


steal.plugins('steal/generate').then('//documentjs/documentjs/jmvcdoc/resources/helpers', function( steal ) {

	ToHTML = {
		searchData: {},
		// takes a path to a docs directory and gets all files in the directory, calling renderPage on each
		getFiles: function( path ) {
			var searchDataText = readFile(path + "/searchData.json")
			this.searchData = eval(searchDataText);
			var dir = new java.io.File(path),
				children = dir.list(),
				i, script, child, htmlFilePath, bodyHTML, sidebarHTML, fullPageHTML;
			for ( i = 0; i < children.length; i++ ) {
				child = "" + children[i];
				if ( child === "searchData.json" || child === "keep.me" || (new java.io.File(path + "/" + child)).isDirectory() ) {
					continue;
				}
				script = readFile(path + "/" + child);
				json = eval(script);
				if (!json.name ) continue;
				htmlFilePath = args.docsLoc + "/" + child.replace(/\.json$/, ".html");
				sidebarHTML = this.renderSidebar(json, child);
				bodyHTML = this.renderPage(json, child);
				title = json.name.replace(/\.static|\.prototype/, "").replace(/\./g, " ");
				fullPageHTML = this.renderLayout(bodyHTML, sidebarHTML, title, child);
				this.saveHTML(fullPageHTML, htmlFilePath);
			}
		},
		// saves html to a file
		saveHTML: function( html, filePath ) {
			new steal.File(filePath).save(html);
		},
		renderLayout: function( bodyHTML, sidebarHTML, title, fileName ) {
			var template = readFile("documentjs/documentjs/jmvcdoc/toHTML/page.ejs");
			html = new steal.EJS({
				text: template
			}).render({
				body: bodyHTML,
				sidebar: sidebarHTML,
				title: title,
				jmvcRoot: jmvcRoot,
				args: args
			});

			return html;
		},
		// creates the body's html
		renderPage: function( json, fileName ) {
			var name = (json.type ? json.type : json.name).toLowerCase(),
				topTemplate = readFile("documentjs/documentjs/jmvcdoc/views/top.ejs"),
				templateName = "documentjs/documentjs/jmvcdoc/views/" + name + ".ejs",
				template = readFile(templateName),
				html,
				api;

			//check for api
			if ( json.name === 'api' ) {
				var names = [];
				for ( var name in Search._data.list ) {
					names.push(name)
				}
				json.apiHtml = this.helpers.link("[" + names.sort(Search.sortJustStrings).join("]<br/>[") + "]", true);
				templateName = "documentjs/jmvcdoc/toHtml/api.ejs";
				template = readFile(templateName);
				
			}

			//print("TEMPLATE: " + fileName);
			json.isFavorite = false;
			if (!json.type ) json.type = "class";
			html = new steal.EJS({
				text: topTemplate
			}).render(json, this.helpers);
			html += new steal.EJS({
				text: template
			}).render(json, this.helpers);
			return html;
		},
		// creates the sidebar's html
		renderSidebar: function( json, fileName ) {
			var html, data, selected = [],
				sidebar = readFile("documentjs/jmvcdoc/toHTML/results.ejs");
			Search.setData(ToHTML.searchData);

			print("TEMPLATE: " + fileName)
			if ( json.children && json.children.length ) { //we have a class or constructor
				selected.push(json);
				var list = jQuery.makeArray(json.children).sort(Search.sortJustStrings),
					converted = [],
					item;
				for ( var j = 0; j < list.length; j++ ) {
					item = ToHTML.searchData.list[list[j]];
					if ( item ) {
						converted.push(item);
					}
				}
				data = {
					list: converted,
					selected: selected,
					hide: false
				};
			} else {
				data = {
					list: Search.find(""),
					selected: selected,
					hide: false
				}
			}

			html = new steal.EJS({
				text: sidebar
			}).render(data, this.helpers);
			return html;
		},
		// creates docs/html directory
		createDir: function( path ) {
			new steal.File(args.docsLoc).mkdir()
		},
		helpers: steal.extend(DocumentationHelpers, {
			link: function( content, dontReplace ) {
				return content.replace(/\[\s*((?:['"][^"']*["'])|[^\|\]\s]*)\s*\|?\s*([^\]]*)\s*\]/g, function( match, first, n ) {
					//need to get last
					//need to remove trailing whitespace
					if (/^["']/.test(first) ) {
						first = first.substr(1, first.length - 2)
					}
					var url = ToHTML.searchData.list[first] ? first : null;
					if ( url ) {
						if (!n ) {
							n = dontReplace ? first : first.replace(/\.prototype|\.static/, "")
						}
						return "<a href='" + url + ".html'>" + n + "</a>"
					} else if ( typeof first == 'string' && first.match(/^https?|www\.|#/) ) {
						return "<a href='" + first + "'>" + (n || first) + "</a>"
					}
					return match;
				})
			},
			linkTags: function( tags ) {
				var res = [];
				for ( var i = 0; i < tags.length; i++ )
				res.push("<a href='" + tags[i] + "'>" + tags[i] + "</a>")
				return res.join(" ");
			},
			linkOpen: function( addr ) {
				return "<a href='" + addr + ".html'>" + addr + "</a>"
			}
		})
	}


	// callback function
	var C = function( json ) {
		return json;
	}

	jQuery = {
		String: {
			underscore: function( s ) {
				var regs = {
					undHash: /_|-/,
					colons: /::/,
					words: /([A-Z]+)([A-Z][a-z])/g,
					lowerUpper: /([a-z\d])([A-Z])/g,
					dash: /([a-z\d])([A-Z])/g
				};
				return s.replace(regs.colons, '/').replace(regs.words, '$1_$2').replace(regs.lowerUpper, '$1_$2').replace(regs.dash, '_').toLowerCase()
			}
		},
		isFunction: function( obj ) {
			return toString.call(obj) === "[object Function]";
		},
		merge: function( first, second ) {
			var i = first.length,
				j = 0;

			if ( typeof second.length === "number" ) {
				for ( var l = second.length; j < l; j++ ) {
					first[i++] = second[j];
				}

			} else {
				while ( second[j] !== undefined ) {
					first[i++] = second[j++];
				}
			}

			first.length = i;

			return first;
		},
		makeArray: function( array, results ) {
			var ret = results || [];

			if ( array != null ) {
				// The window, strings (and functions) also have 'length'
				// The extra typeof function check is to prevent crashes
				// in Safari 2 (See: #3039)
				if ( array.length == null || typeof array === "string" || jQuery.isFunction(array) || (typeof array !== "function" && array.setInterval) ) {
					push.call(ret, array);
				} else {
					jQuery.merge(ret, array);
				}
			}

			return ret;
		}

	}

	Search = {
		setData: function( data ) {
			this._data = data;
			return arguments;
		},
		find: function( val ) {
			var valWasEmpty, level = 2;
			var val = val.toLowerCase();

			if (!val || val === "*" ) {
				val = "home"; // return the core stuff
				valWasEmpty = true;
			}

			if ( val == "favorites" ) return Favorites.findAll()

			var current = this._data;
			var list = [];
			if ( current && val.length > level ) {
				//make sure everything in current is ok
				var lookedup = this.lookup(current.list);
				for ( var i = 0; i < lookedup.length; i++ ) {
					if ( this.matches(lookedup[i], val, valWasEmpty) ) list.push(lookedup[i])
				}
			} else if ( current ) {
				list = this.lookup(current.list);
			}
			return list.sort(this.sortFn);
		},
		matches: function( who, val, valWasEmpty ) {
			if (!valWasEmpty && who.name.toLowerCase().indexOf(val) > -1 ) return true;
			if ( who.tags ) {
				for ( var t = 0; t < who.tags.length; t++ ) {
					if ( who.tags[t].toLowerCase().indexOf(val) > -1 ) return true;
				}
			}
			return false;
		},
		sortFn: function( a, b ) {
			//print("a: "+a+", b: "+b);
			//if equal, then prototype, prototype properties go first
			var aname = (a.title ? a.title : a.name).replace(".prototype", ".000AAAprototype").replace(".static", ".111BBBstatic");
			var bname = (b.title ? b.title : b.name).replace(".prototype", ".000AAAprototype").replace(".static", ".111BBBstatic");


			if ( aname < bname ) return -1
			else aname > bname
			return 1
			return 0;
		},
		sortJustStrings: function( aname, bname ) {
			var aname = aname.replace(".prototype", ".000AAAprototype").replace(".static", ".111BBBstatic");
			var bname = bname.replace(".prototype", ".000AAAprototype").replace(".static", ".111BBBstatic");


			if ( aname < bname ) return -1
			else aname > bname
			return 1
			return 0;
		},
		lookup: function( names ) {
			var res = [];
			for ( var i = 0; i < names.length; i++ ) {
				res.push(this._data.list[names[i]])
			}
			return res;
		}
	}

	ToHTML.createDir(args.path);
	ToHTML.getFiles(args.path);

});