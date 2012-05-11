steal('can/control',
	'can/observe/delegate',
	'documentjs/jmvcdoc/models/search.js',function($){

/**
 * @class Jmvcdoc.Search
 */
can.Control('Jmvcdoc.Search',
/* @Static */
{
	defaults : {
	
	}
},
/* @Prototype */
{
	setup:function(el,options){
		this.input = $(el);
		this.input.wrap("<div>");
		
		var parent = this.input.parent();
		this.remove = $("<span title='clear term' class='remove'></span>").appendTo(parent);
		
		can.Control.prototype.setup.call(parent,options);
	},
	init : function(){
		this.input.attr('disabled', false)
	},
	"input keyup" : function(el, ev){
		clearTimeout(this.searchTimer);
		if((el.val() == "" && typeof can.route.attr('who') == 'undefined') || ev.keyCode == 27){
			can.route.attrs({ who : "index" }, true);
		} else if(el.val() != ""){
			this.searchTimer = setTimeout($.proxy('search', this),200)
		}
	},
	search : function(){
		can.route.attrs({
			search: this.input.val()
		}, true);
	},
	"{clientState} search set" : function(clientState, ev, newVal){
		this.input.val(newVal);
		
		if(newVal && newVal != ""){
			this.remove.show();
		} else {
			this.remove.hide();
		}
	},
	".remove click":function(el, events){
		can.route.attr({
			search: ""
		}, true);
	},
	focusin : function(){
		this.focused = true;
	},
	focusout : function(){
		this.focused = false;
	}
})

});