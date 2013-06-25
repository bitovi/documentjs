steal('../libs/underscore.js', function (_) {
	var exports = {};
	var getParents = function (children) {
		var parents = [];
		var gatherParents = function (children) {
			var current = _.find(children, function (child) {
				return child.active;
			});

			if (!current) {
				return;
			}

			parents.push(current);
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
	exports.findItem = function(root, name){
		
		var traverse = function (children) {
			var anyActive = false;
			for(var i = 0; i < children.length; i++){
				if(children[i].name == name){
					return children[i]
				} else if(children[i].children){
					var res = traverse(children[i].children);
					if(res){
						return res;
					}
				}
			}
			return;
		}
		return traverse(root.children);
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
	exports.linkTo = function(name, title, attrs){
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
	}
	var data, 
		config,
		menuData;
	exports.data = function(d){
		if(d){
			data = d;
		} else {
			return data;
		}
	}
	exports.menuData = function(d){
		if(d){
			menuData = d;
		} else {
			return data;
		}
	}

	exports.config = function(c){
		if(c){
			config = c;
		} else {
			return config;
		}
	}

	exports.helpers = {
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
				return exports.linkTo(param.types && param.types[0] && param.types[0].type, param.name)
			}).join(", ")
		},
		makeTypes: function(types){
			if (types.length) {
				// turns [{type: 'Object'}, {type: 'String'}] into '{Object | String}'
				return types.map(function (t) {
					if(t.type === "function"){
						var fn = "("+exports.helpers.makeParamsString(t.params)+")";
						
						if(t.constructs && t.constructs.types){
							fn = "constructor"+fn;
							fn += " => "+exports.helpers.makeTypes(t.constructs.types)
						} else {
							fn = "function"+fn;
						}
						
						return fn;
					}
					var type = data[t.type];
					var title = type && type.title || undefined;
					
					var txt = exports.linkTo(t.type, title);
					if(t.template && t.template.length){
						txt += "&lt;"+t.template.map(function(templateItem){
							return exports.helpers.makeTypes(templateItem.types)
						}).join(",")+"&gt;"
					}
					if(type){
						if(type.type === "function" && (type.params || type.signatures)){
							var params = type.params || (type.signatures[0] && type.signatures[0].params ) || []
						} else if(type.type === "typedef" && type.types[0] && type.types[0].type == "function"){
							var params = type.types[0].params;
						}
						if(params){
							txt += "("+exports.helpers.makeParamsString(params)+")";
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
				var txt = "{"+exports.helpers.makeTypes(types);
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
		activeParents: function (options) {
			var parents = getParents(this.children);
			var active = _.last(parents);
			var hasConstructorParent = (active && (!active.children || !active.children.length)) && parents.length > 2
				&& parents[parents.length - 3].type === 'constructor';

			if (hasConstructorParent) {
				// Active has no children so lets check if it is part of a construct
				parents = parents.slice(0, parents.length - 3);
			} else {
				parents.pop();
			}

			if( (!active.children || !active.children.length) && !hasConstructorParent) {
				parents.pop();
			}

			parents = _.filter(parents, function(parent) {
				return parent.type !== 'group';
			});

			// Add root level at the beginning
			parents.unshift(this);

			return options.fn(parents);
		},
		activeMenu: function (options) {
			var parents = getParents(this.children);
			var active = _.last(parents);

			if ((active && (!active.children || !active.children.length)) && parents.length > 2) {
				var newActive = parents[parents.length - 3];
				if(newActive.type === 'constructor') {
					// Active has no children so lets check if it is part of a construct
					active = newActive;
				}
			}

			if(!active.children || !active.children.length) {
				active = parents[parents.length - 2];
			}
			
			if(!active){
				active = parents[0];
			}

			return options.fn(active);
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
			var item = exports.findItem(menuData, this.api || this.name)
			if(!item){
				return "Can't find "+this.name+"!";
			}
			var makeSignatures = function(signatures, defaultDescription, parent){
				
				signatures.forEach(function(signature){
					txt += "<div class='small-signature'>"
					txt += exports.linkTo(parent, "<code class='prettyprint'>"+signature.code+"</code>",{"class":"sig"});
					
					
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
	};

	return exports;
});
