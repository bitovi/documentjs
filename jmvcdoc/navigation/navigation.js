steal('can',
	'./children.ejs',
	'documentjs/jmvcdoc/models/search.js','can/observe/delegate',
	function( can, childrenEJS ) {
	
	
	return can.Control({
		init: function(){
			this.contentsSet = false;
			this.element.addClass('sidebar')
		},
		"{can.route} who set" : function (clientState, ev, val) {
			if (Doc.dataDeferred.state() === 'resolved') {
				this.navFor(val)
			} else {
				Doc.dataDeferred.then(this.proxy('navFor', val))
			}
		},
		navFor: function(){
			if(!this.contentsSet) {
				// get all children of index recursively and create
				this.contentsSet = true;
				this.layoutChildren()
			}
		},
		layoutChildren: function(){
			var index = Doc.findOne({
				name : window.DOCS_INDEX || "index"
			}),
				hasChild = function(item, who){
					var child;
					for(var i = 0 ; i < item.children.length; i++){
						child = item.children[i];
						if(child.id === who || hasChild(child, who)){
							return true
						}
					}
					return false;
				}
			
			var top = this.groupChildren(index,"",[]);
			this.element.html( childrenEJS(top,{
				childRender: childrenEJS.render,
				isDisplayed: function(item){
					if(item.displayOnly || item.id === "index"){
						return true;
					}
					var who = can.route.attr('who');
					if(who === item.id){
						return true
					}
					return hasChild(item,who  ) ;
				},
				isActive: function(item){
					if(item.displayOnly || item.id === "index"){
						return false;
					}
					var who = can.route.attr('who');
					if(who === item.id){
						return true
					}
					return hasChild(item,who  ) ;
				}
			}) )
			this.element.children().addClass("api")
		
		},
		groupChildren : function(item, parentId,parents){
			// if there's a prototype or a static
			// move into those children
			var cur = {
				id: item.name,
				name: (item.title || item.name).replace(parentId,"").replace(/^[\/\.]/,""),
				children: [],
				type:item.type,
				parents: parents
			},
				self = this;


			var pagesItem = {
				id: item.name+".pages",
				name: "pages",
				children: [],
				type: "pages",
				destroyOnly: true
			},
				pluginsItem = {
					id: item.name+".plugins",
					name: "plugins",
					children: [],
					type: "plugins",
					displayOnly: true
				},
				naturalChildren = [],
				protoItem,
				staticItem;
			
			can.each(item.childDocs || [],function(name){
				var childItem = Doc.findOne({
					name : name
				}),
					child = self.groupChildren(childItem,item.name,parents.concat(cur.id))
				
				cur.children.push(child);
				
				if( /static$/.test( child.name ) ) {
					staticItem = child
					staticItem.displayOnly = true;
				} else if ( /prototype$/.test( child.name ) ) {
					protoItem = child;
					protoItem.displayOnly = true;
				} else if( child.type == "plugin"){
					
					pluginsItem.children.push(child);
					
				} else {
					pagesItem.children.push(child)
				}
				
				
			})
			
			
			if(protoItem || staticItem) {
				cur.children = [];
				if(protoItem){
					cur.children.push(protoItem)
				}
				if(staticItem){
					cur.children.push(staticItem)
				}
				if(pluginsItem.children.length){
					cur.children.push(pluginsItem)
				}
				if(pagesItem.children.length){
					cur.children.push(pagesItem)
				}
			}
			return cur;
		}
	})
	
	
})
