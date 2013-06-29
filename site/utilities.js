steal('../libs/underscore.js', function (_) {
	var exports = {};
	// given the children of the root menu item
	var getParents = function (children) {
		var parents = [];
		var gatherParents = function (children) {
			// check if their is a currently active child
			var current = _.find(children, function (child) {
				return child.active;
			});

			// if not exit
			if (!current) {
				return;
			}
			// add that to parents
			parents.push(current);
			
			// if the current item has children, go into them
			
			if (current.children && current.type) {
				gatherParents(current.children);
			}
		}

		gatherParents(children);
		return parents;
	}
	var sortChildren = function(child1, child2){

				// put groups at the end
				if(/group|prototype|static/i.test(child1.type)){
					if(!/group|prototype|static/i.test(child2.type)){
						return 1;
					}
				}
				if(/group|prototype|static/i.test(child2.type)){
					return -1;
				}

				if(typeof child1.order == "number"){
					if(typeof child2.order == "number"){
						return child1.order - child2.order;
					} else {
						return -1;
					}
				} else {
					if(typeof child2.order == "number"){
						return 1;
					} else {
						// alphabetical
						if(child1.name < child2.name){
							return -1
						}
						return 1;
					}
				}
			}
	
	var constructorParentPosition = function(children) {
		var parents = getParents(children);
		var active = _.last(parents);

		if ((active && (!active.children || !active.children.length)) && parents.length > 2) {
			// Active has no children so lets check if it is part of a construct
			return parents.length - 3;
		}

		return parents.length;
	}

	exports.docsFilename = function (name) {
		return name.replace(/ /g, "_")
			.replace(/&#46;/g, ".")
			.replace(/&gt;/g, "_gt_")
			.replace(/\*/g, "_star_")
			.replace(/\//g, "|") + '.html';
	}

	exports.name = function (file) {
		return file.substring(0, file.lastIndexOf('.'));
	}

	exports.handlebarsHelpers = function (helpers, Handlebars) {
		if (helpers && Handlebars) {
			_.each(helpers, function (helper, name) {
				Handlebars.registerHelper(name, helper);
			});
		}
		return Handlebars;
	}

	exports.handlebarsPartials = function (folder, Handlebars) {
		new steal.URI(folder).contents(function (name) {
			var template = readFile(folder + '/' + name);
			Handlebars.registerPartial(name, template);
		});

		return Handlebars;
	}
	
	exports.handlebarStatics = function(configuration, docData, layout, Handlebars){
		if(configuration.statics && configuration.statics.src){
			print("Rendering mustache files in "+configuration.statics.src+" to "+(configuration.statics.dest||'.'))
			
			new steal.URI(configuration.statics.src).contents(function (name) {
				if(name.indexOf(".mustache")>0){
					print("  "+name)
					var template = readFile(configuration.statics.src + '/' + name);
					var renderer = Handlebars.compile(template);
					
					var data = _.extend({},configuration,docData)
					
					var content = renderer(data);
					
					var contents = layout(_.extend({
						content: content
					}, data));

					new steal.URI(
						(configuration.statics.dest||'')+
						name.replace(".mustache",".html")
						).save(contents);
				}
				
			});
			
		}
		
	}
	

	exports.activateItems = function (root, name) {
		var matched;
		var traverse = function (children) {
			var anyActive = false;
			_.each(children, function (child) {
				var active = false;
				if (child.children) {
					active = traverse(child.children);
				}
				child.active = active || child.name == name;
				if(child.name === name){
					matched = matched;
				}
				if (child.active) {
					anyActive = true;
				}
			});

			return anyActive;
		}

		if(!root) {
			print('WARNING: No children for ' + name);
		} else {
			traverse(root.children || []);
		}

		return matched || root;
	}

	exports.menuTree = function (data, root) {
		var copies = _.map(data, function (value) {
			return _.extend({
				active: false
			}, value);
		});

		_.each(copies, function (current, index, arr) {
			var parent = _.find(arr, function (value) {
				return value.name === current.parent;
			});

			if (parent) {
				parent.children = parent.children || [];
				parent.children.push(current);
				parent.children = _.sortBy(parent.children, function (child) {
					return child.order || child.name;
				});
			}
		});

		if (root) {
			return _.find(copies, function (current) {
				return current.name == root;
			});
		}

		return copies;
	}

	exports.replaceLinks = function (text, data) {
		if (!text) return "";
		var replacer = function (match, content) {
			var parts = content.match(/^(\S+)\s*(.*)/);
			var link = parts ? parts[1].replace('::', '.prototype.') : content;
			var description = parts && parts[2] ? parts[2] : link;

			if(/^http/.test(link)) {
				return '<a href="' + link + '">' + description + '</a>';
			}

			if (data[link]) {
				return '<a href="' + exports.docsFilename(link) + '">' + description + '</a>';
			}

			return match;
		};
		return text.replace(/[\[](.*?)\]/g, replacer);
	}
	
	var setupChildrenOnData = function(data){
		
		// go through everything in data and
		// add yourself to your parent's children array
		_.each(data, function (current, name) {
			
			// make sure it has a parent
			if(current.parent){
				
				var parent = data[current.parent]

				if (parent && parent.name !== name) {

					parent.children = parent.children || [];
					parent.children.push(current);
				}
				
			}
			
		});
		
	}
	
	exports.helpers = function(data, config, getCurrent){
		
		setupChildrenOnData(data);
		
		var helpers = {
			docLinks: function(text){
				return exports.replaceLinks(text, data);
			},
			linkTo: function(name, title, attrs){
				if (!name) return (title || "");
				name = name.replace('::', '.prototype.');
				if (data[name]) {
					var attrsArr = [];
					for(var prop in attrs){
						attrsArr.push(prop+"=\""+attrs[prop]+"\"")
					}
					return '<a href="' + exports.docsFilename(name) + '" '+attrsArr.join(" ")+'>' + (title || name ) + '</a>';
				} else {
					return title || name || ""
				}
			},
			getParentsPathToSelf: function(name){
				var names = {};
				
				// walk up parents until you don't have a parent
				var parent = data[name],
					parents = [];
					
				// don't allow things that are their own parent
				if(parent.parent === name){
					return parents;
				}
				
				while(parent){
					parents.unshift(parent);
					if(names[parent.name]){
						return parents;
					}
					names[parent.name] = true;
					parent = data[parent.parent];
				}
				return parents;
			},
			
			activePage: function (current, expected) {
				return current == this.page ? 'active' : '';
			},
	
			getTitle: function () {
				var node = this;
				
				if (node.title) {
					return node.title
				}
				// name: "cookbook/recipe/list.static.defaults"
				// parent: "cookbook/recipe/list.static"
				// src: "cookbook/recipe/list/list.js"
				var parentParent = data[node.parent] && data[node.parent].parent;
				// check if we can replace with our parent
				if( node.name.indexOf(node.parent + ".") == 0){
					var title = node.name.replace(node.parent + ".", "");
				} else if(parentParent && parentParent.indexOf(".") > 0 && node.name.indexOf(parentParent + ".") == 0){
					// try with our parents parent
					var title = node.name.replace(parentParent + ".", "");
				} else {
					title = node.name
				}
				
				return title;
			},
	
			url: function (url) {
				return this.root + '/' + url;
			},
	
			makeHref: function (name) {
				if(name == config.parent){ // name is the topmost parent
					return 'index.html'
				}
				return exports.docsFilename(name);
			},
			hasActiveChild: function (options) {
				var hasActiveChild = _.some(this.children, function (child) {
					return child.active;
				});
	
				return hasActiveChild ? options.fn(this) : options.inverse(this);
			},
			isGroup: function(options){
				if(/group|prototype|static/i.test(this.type)){
					return options.fn(this)
				} else {
					return options.inverse(this)
				}
			},
			isConstructor: function (options) {
				if (this.type === 'constructor') {
					return options.fn(this);
				}
				return options.inverse(this);
			},
			makeParamsString: function(params){
				if(!params || !params.length){
					return ""
				}
				return params.map(function(param){
					return helpers.linkTo(param.types && param.types[0] && param.types[0].type, param.name)
				}).join(", ")
			},
			makeTypes: function(types){
				if (types.length) {
					// turns [{type: 'Object'}, {type: 'String'}] into '{Object | String}'
					return types.map(function (t) {
						if(t.type === "function"){
							var fn = "("+helpers.makeParamsString(t.params)+")";
							
							if(t.constructs && t.constructs.types){
								fn = "constructor"+fn;
								fn += " => "+helpers.makeTypes(t.constructs.types)
							} else {
								fn = "function"+fn;
							}
							
							return fn;
						}
						var type = data[t.type];
						var title = type && type.title || undefined;
						
						var txt = helpers.linkTo(t.type, title);
						if(t.template && t.template.length){
							txt += "&lt;"+t.template.map(function(templateItem){
								return helpers.makeTypes(templateItem.types)
							}).join(",")+"&gt;"
						}
						if(type){
							if(type.type === "function" && (type.params || type.signatures)){
								var params = type.params || (type.signatures[0] && type.signatures[0].params ) || []
							} else if(type.type === "typedef" && type.types[0] && type.types[0].type == "function"){
								var params = type.types[0].params;
							}
							if(params){
								txt += "("+helpers.makeParamsString(params)+")";
							}
						}
						
						return txt;
					}).join(' | ');
				} else {
					return '';
				}
			},
			equal: function( first, second, options ) {
				if(first == second){
					return options.fn(this);
				} else {
					return options.inverse(this);
				}
			},
			makeTypesString: function (types) {
				if (types.length) {
					// turns [{type: 'Object'}, {type: 'String'}] into '{Object | String}'
					var txt = "{"+helpers.makeTypes(types);
					//if(this.defaultValue){
					//	txt+="="+this.defaultValue
					//}
					return txt+"}";
				} else {
					return '';
				}
			},
			downloadUrl: function (download, isPlugin) {
				return '';
				if (isPlugin) {
					download = 'plugins=' + download;
				}
				// TOOO make builder URL configurable
				return 'http://bitbuilder.herokuapp.com/can.custom.js?' + download;
			},
			sourceUrl: function (src, type, line) {
				return '';
				var pkg = {},
					relative = path.relative(grunt.config('can.path'), src),
					hash = type !== 'page' && type !== 'constructor' && line ? '#L' + line : '';
				return pkg.repository.github + '/tree/v' + pkg.version + '/' + relative + hash;
			},
			testUrl: function (test) {
				return '';
				// TODO we know we're in the docs/ folder for test links but there might
				// be a more flexible way for doing this
				return '../' + test;
			},
			/*
			 * Provides a parents array of items and the 
			 * last parent menu as the "active" item
			 */
			activeAndParents: function(options){
				var parents = helpers.getParentsPathToSelf(getCurrent().name);
				var	active = parents.pop();
				
				if(!active){
					// there are no parents, possibly nothing active
					parents = []
					active = data[config.parent]
				} else if(!active.children && parents.length){
					// we want to show this item along-side it's siblings
					// make it's parent active
					active = parents.pop();  
					
					// if the original active was in a group, prototype, etc, move up again
					if(parents.length && /group|prototype|static/i.test( active.type) ){
						active = parents.pop()
					}
				}
				
				// remove groups because we don't want them showing up
				parents = _.filter(parents, function(parent) {
					return parent.type !== 'group';
				});
				
				// Make sure root is always here
				if(active.name !== config.parent && (!parents.length || parents[0].name !== config.parent)  ){
					parents.unshift(data[config.parent]);
				}
				return options.fn({
					parents: parents,
					active: active
				})
			},
			isActive: function(options){
				if(this.name == getCurrent().name){
					return options.fn(this)
				} else {
					return options.inverse(this)
				}
			},
			orderedChildren: function(children, options){
				children = (children || []).slice(0).sort(sortChildren);
				var res = "";
				children.forEach(function(child){
					res += options.fn(child)
				})
				return res;
			},
			apiSection: function(options){
				var depth = (this.api && this.api !== this.name ? 1 : 0);
				var txt = "",
					periodReg = /\.\s/g;
				var item = data[this.api || getCurrent().name]
				if(!item){
					return "Can't find "+this.name+"!";
				}
				var makeSignatures = function(signatures, defaultDescription, parent){
					
					signatures.forEach(function(signature){
						txt += "<div class='small-signature'>"
						txt += helpers.linkTo(parent, "<code class='prettyprint'>"+signature.code+"</code>",{"class":"sig"});
						
						
						var description = (signature.description || defaultDescription)
							// remove all html tags
							.replace(/<\/?\w+((\s+\w+(\s*=\s*(?:".*?"|'.*?'|[^'">\s]+))?)+\s*|\s*)\/?>/g,"");
							
						periodReg.lastIndex = 0;
						periodReg.exec(description)
						var lastDot = periodReg.lastIndex;
						
						txt += "<p>"+exports.replaceLinks(lastDot != 0 ? description.substr(0, lastDot): description, data)+"</p>"
						txt += "</div>"
					})
				}
				var process = function(child){
					if(child.hide ){
						return;
					}
					txt += "<div class='group_"+depth+"'>"
					var item = data[child.name]
					if( item.signatures && child.type !== "typedef" ){
						makeSignatures(item.signatures, item.description, child.name)
					}
					if(child.children){
						depth++;
						child.children.sort(sortChildren).forEach(process)
						depth--;
					}
					txt += "</div>"
				}
				
				item.children.sort(sortChildren).forEach(process)
				
				
				return txt
			}
		}
		return helpers;
	};


	return exports;
});
