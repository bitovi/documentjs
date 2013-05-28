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

	exports.activateItems = function (root, name) {
		var traverse = function (children) {
			var anyActive = false;
			_.each(children, function (child) {
				var active = false;
				if (child.children) {
					active = traverse(child.children);
				}
				child.active = active || child.name == name;
				if (child.active) {
					anyActive = true;
				}
			});

			return anyActive;
		}

		traverse(root.children);

		return root;
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
			var parts = content.match(/^(\S+)\s(.*)/);
			var link = parts ? parts[1].replace('::', '.prototype.') : content;
			var description = parts && parts[2] ? parts[2] : link;

			if (data[link]) {
				return '<a href="' + exports.docsFilename(link) + '">' + description + '</a>';
			}

			return match;
		};
		return text.replace(/[\[](.*?)\]/g, replacer);
	}
	exports.linkTo = function(name, title){
		if (!name) return (title || "");
		name = name.replace('::', '.prototype.')
		if (data[name]) {
			return '<a href="' + exports.docsFilename(name) + '">' + (name || title) + '</a>';
		} else {
			return title || name || ""
		}
	}
	var data;
	exports.data = function(d){
		if(d){
			data = d;
		} else {
			return data;
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
			var title = node.name.replace(node.parent + ".", "");
			return title;
		},

		url: function (url) {
			return this.root + '/' + url;
		},

		makeHref: function (name) {
			return exports.docsFilename(name);
		},
		hasActiveChild: function (options) {
			var hasActiveChild = _.some(this.children, function (child) {
				return child.active;
			});

			return hasActiveChild ? options.fn(this) : options.inverse(this);
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
						return "function("+exports.helpers.makeParamsString(t.params)+")";
					}
					return t.type;
				}).join(' | ');
			} else {
				return '';
			}
		},
		makeTypesString: function (types) {
			if (types.length) {
				// turns [{type: 'Object'}, {type: 'String'}] into '{Object | String}'
				return "{"+exports.helpers.makeTypes(types)+"}";
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

			if ((active && (!active.children || !active.children.length)) && parents.length > 2
				&& parents[parents.length - 3].type === 'constructor') {
				// Active has no children so lets check if it is part of a construct
				parents = parents.slice(0, parents.length - 3);
			} else {
				parents.pop();
			}

			if(!active.children || !active.children.length) {
				parents.pop();
			}

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

			return options.fn(active);
		},
		orderedChildren: function(children, options){
			children = children.slice(0).sort(function(child1, child2){
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
			});
			var res = "";
			children.forEach(function(child){
				res += options.fn(child)
			})
			return res;
		}
	};

	return exports;
});
