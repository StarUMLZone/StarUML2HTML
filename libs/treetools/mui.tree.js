/********************************************************************************
*              Plugin de création de l'arbre HTML (version 4.1)                 *
*                                                                               *
* Modifié par: ROLLAND Romain                                                   *
* Date : 23/03/09                                                               *
*********************************************************************************/

if(!window["MUI"]) 
	window["MUI"]={};

MUI.Node = new Class({
    initialize:function(title, options){
		this.title = title;
		this.setOptions(options);
    },
    
    setOptions:function(options){
		this.options = Object.extend({}, options);
    },
    
    render:function(){
		var s = new Element("span").appendText(this.title);
		s.setProperty("class", this.class);
		return s;
    },
    
    bringIn:function(el){
		el = $(el);
		this.title = el.innerHTML;
		this.class = el.getProperty("class");
		return this;
    }
});

MUI.Node.dots = ""

MUI.LinkNode = new Class({
    
    Extends: MUI.Node,
    
    initialize:function(title, url){
		this.parent(title);
		this.url = url;
    },
    
    render:function(){
		var a = new Element("a").setProperty("href", this.url);
		a.setProperty("class", this.class);
		a.setProperty("id", this.id);
		a.setProperty("target", this.target);
		a.setProperty("onclick", this.onclick);
		a.setProperty("name", this.name);
		return a.appendText(this.title);
    },
    
    bringIn:function(el){
		el = $(el);
		this.title = el.innerHTML;
		this.url = el.getProperty("href");
		this.class = el.getProperty("class");
		this.id = el.getProperty("id");
		this.target = el.getProperty("target");
		this.onclick = el.getProperty("onclick");
		this.name = el.getProperty("name");
		return this;
    }
});

MUI.Tree = new Class({
    
    Extends: MUI.Node,
    
    Implements: [Events, Options],
    
    initialize: function(title, options){
		this.parent(title, options);
		this._children = [];
    },
    
    addChild: function(oChild){
		if(oChild.Extends == MUI.Node || oChild instanceof MUI.Node){
		    this._children[this._children.length] = oChild;
		}
    },
    
    removeChild: function(oChild){
		if($type(oChild)=='number'){
		    this._children = this._children.splice(oChild,1);
		}else{
		    this._children = this._children.remove(oChild);
		}
    },
    
    titleClicked:function(){
		this.opened = !!this.opened;
		if(!this.opened){
		    this._listEl.setStyle('display', 'block');
		}else{
		    this._listEl.setStyle('display', 'none');
		}
		this.opened = !this.opened;
		var eventName = this.opened?"onExpand":"onCollapse";
		this.fireEvent(eventName);
		MUI.Tree.GlobalEvents.fireEvent(eventName, [this]);	
    },
    
    expand:function(all){
		if(all){
		    this._children.each(function(oChild){
			if(oChild instanceof MUI.Tree){
			    oChild.titleClicked();
			}
		    });
		}
		this.titleClicked();
    },
    
    render:function(root){
		var selfEl = new Element("div").addClass("mui-tree");
		var self = this;

		this._titleEl = new Element("div")
				    .addClass("mui-treetitle")
				    .injectInside(selfEl);
				    
		this._titleEl.adopt(this.title.render());
		
		// Create the children list
		if(this._children.length>0){
		    this._titleEl.addEvent("click", this.titleClicked.bind(this));
	
		    this._listEl = new Element("ul").setStyle("display","none");
		    this._children.each(function(oChild){
			new Element("li").adopt( oChild.render() ).injectInside(this._listEl);
		    }.bind(this));
		    this._listEl.injectInside(selfEl);
		    
		}
	        
		return selfEl;
    },
    
    bringIn: function(container){
//        console.log('entered');
		container = $(container);
		//if(!container.hasClass("mui-tree")) return;
		var title = container.getFirst().firstChild;
		if(title.nodeName=="A"){
		    this.title = new MUI.LinkNode().bringIn(title);
		}else{
		    this.title = new MUI.Node(title.nodeValue);
		}
	
		var mainTreeEl = $(container.getElementsByTagName("ul")[0]),
	    nodesEls = mainTreeEl.getChildren();
		nodesEls.each(function(nodeEl){
		    if(nodeEl.parentNode==mainTreeEl){
				var firstChild = nodeEl.getFirst();
//		                console.log(firstChild);
				if(firstChild.hasClass("mui-tree")){
//		                    console.log(true);
				    this.addChild(new MUI.Tree().bringIn(firstChild));
				}else if(firstChild.get('tag')=='a'){
				    this.addChild(new MUI.LinkNode().bringIn(firstChild));
				}else{
				    this.addChild( new MUI.Node().bringIn(firstChild) );
				}
		    }
		}.bind(this));
	
		return this;
    }
});

// MUI.Tree.GlobalEvents - used for registering events for all trees
MUI.Tree.GlobalEvents = new Events();

Element.implement({
    makeAsTree:function(){
		if(this.hasClass("mui-tree")){
	        //alert(new MUI.Tree().bringIn(this));
		    var tree = new MUI.Tree().bringIn(this).render();
	        //console.log(tree);
	        tree.replaces(this);
		}
    }
});

