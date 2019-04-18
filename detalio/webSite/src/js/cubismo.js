/* globals webix $$ */

//notify({title: "Works", text: "good!", icon: "/files/img/envelop.png"});

Notification.requestPermission();
//var notification = new Notification("must work!", 
// {
//   icon: "/files/img/envelop.png", 
//   body: "body"
// });

var User = {};
var sections = {};

webix.Date.startOnMonday = true;

var subStringSearch = {};
subStringSearch.inProcess = false;
subStringSearch.subString = '';

var popup = 
  {
    view:"window",
    id:"subStringSearchPopup",
    height:34, 
    width:300,
    head: {
        cols: [
          {
            view: "text",
            id: "subStringSearchText"
          },
          {
            view:"icon", icon:"times", css:"alter",
            click:"$$('subStringSearchPopup').close(); subStringSearch.subString = ''; cancelLikeFilter();"
          }
        ]
    }
  }

document.onclick = function(e) {
  var e = e || window.event;
  if(subStringSearch.activeView) {
    var offset = webix.html.offset(subStringSearch.activeView.getNode());
    if(e.clientX < offset.x ||
       e.clientX > (offset.x+offset.width) ||
       e.clientY < offset.y || 
       e.clientY > (offset.y+offset.height)) {
        subStringSearch.activeView = undefined;
        subStringSearch.subString = ''; 
        cancelLikeFilter();
    }
    
    var element = document.elementFromPoint(e.clientX, e.clientY);
    var attributeName = element.getAttribute("attributeName");
    if(attributeName) {
      subStringSearch.attributeName = attributeName;
    }
  }
};

// document.onkeydown = function(e) {
//   var key = e.keyCode || e.charCode;

//   if( key == 8 || key == 46 ) {
//     if(subStringSearch.activeView) {
//       subStringSearch.subString = subStringSearch.subString.slice(0, -1);
//       makeLikeFilter();
//       e.preventDefault();
//       return false;
//     }
//   };

//   if( key == 27 ) {
//     subStringSearch.subString = "";
//     cancelLikeFilter();
//     e.preventDefault();
//     return false;
//   };
// };

// document.onkeypress = function(e) {
//   if(subStringSearch.activeView) {
//     subStringSearch.subString += getChar(e);
//     makeLikeFilter();
//   }
// }

function makeLikeFilter(view) {
  // var pop = $$('subStringSearchPopup');
  // if(!pop) {
  //   webix.ui(popup).show();
  //   var pop = $$('subStringSearchPopup');
  // };
  // $$('subStringSearchText').setValue(subStringSearch.subString);
  // subStringSearch.activeView.focus();
  
  // var offset = webix.html.offset(subStringSearch.activeView.getNode());
  // pop.setPosition(offset.x+3, offset.y+offset.height-39);
  // pop.$setSize(offset.width-6, 36);
  
  if(!subStringSearch.inProcess) {
    var searchFunction = function() {
      setLikeFilter(view);
    }
    setTimeout(searchFunction, 1000);
    subStringSearch.inProcess = true;
  }
}

function getChar(event) {

  if (event.which == null) { // IE
    if (event.keyCode < 32) {
      return ''; // спец. символ
    } else {
      return String.fromCharCode(event.keyCode);
    }
  }

  if (event.which != 0 || event.charCode != 0 || event.keyCode != 0) { // все кроме IE
    if (event.which < 32) {
      return ''; // спец. символ
    } else {
      return String.fromCharCode(event.which); // остальные
    }
  }

  return ''; // спец. символ
}

function setLikeFilter(view) {
  var params = {
    appID: window.ApplicationID,
    FormID: view.config.formID,
    viewName: view.config.name,
    command: 'setLikeFilter',
    attributeName: subStringSearch.attributeName,
    prevAttributeName: subStringSearch.prevAttributeName,
    value: subStringSearch.subString
  }
  ServerCall(params);
  subStringSearch.prevAttributeName = subStringSearch.attributeName;
  subStringSearch.inProcess = false;
}

function cancelLikeFilter(view) {
  //view.focus();
  setLikeFilter(view);
}

if (document.addEventListener) { // IE >= 9; other browsers
  document.addEventListener('contextmenu', function(e) {
    // alert("You've tried to open context menu"); //here you draw your own menu
    e.preventDefault();
  }, false);
} else { // IE < 9
  document.attachEvent('oncontextmenu', function() {
    // alert("You've tried to open context menu");
    window.event.returnValue = false;
  });
}

// DataDriver JSON
webix.DataDriver.json = webix.extend({
  parseDates:true,
  toObject:function(data){
		if (!data) return null;
		if (typeof data == "string"){
			try{
				if (this.parseDates){
					var isodate = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(.\d{3})?Z/;
					data = JSON.parse(data, function(key, value){
						if (typeof value == "string"){
							if (isodate.test(value)) {
                return new Date(value);
              }
						}
						return value;
					});
				} else {
					data =JSON.parse(data);
				}
			} catch(e){
				webix.log(e);
				webix.log(data);
				webix.assert_error("Invalid JSON data for parsing");
				return null;
			}
		}
		return data;
	}
}, webix.DataDriver.json);

// Window
webix.protoUI({
  name:"Window",
  $init: function (config) {
    this.$ready.push(this._Init);
  },
  _Init: function () {
    window.WindowID = this.config.id;
    var self = this;
    setTimeout(function() {
      self.$view.style.height = "100%";
    }, 100);
    socket.emit('WindowLoad', {WindowID: this.config.id, ApplicationID: window.ApplicationID}, window.WindowID);
    var Message = {};
    Message.FormID    = this.config.id;
    Message.Command   = 'OnLoad';
    ServerCall(Message);
  }
}, webix.ui.layout);

// Form
webix.protoUI({
  name:"Form",
  $init: function (config) {
    this.$ready.push(this._Init);
  },
  _Init: function () {
    socket.emit('FormLoad', {FormID: this.config.id, ApplicationID: window.ApplicationID}, window.WindowID);
    var Message = {};
    Message.FormID  = this.config.id;
    Message.Command = 'OnLoad';
    ServerCall(Message);
  }
}, webix.ui.layout);

// FormsBar
webix.protoUI({
  name:"tabview",
  $init: function (config) {
    this.$ready.push(this._Init);
  },
  _Init: function () {
    var x = this.$view.getElementsByClassName("webix_multiview");
    for (let i = 0; i < x.length; i++) {
      x[i].style.marginTop = "-1px";
    } 
  }
}, webix.ui.tabview);

// Toolbar
webix.protoUI({
  name:"Toolbar"
}, webix.ui.toolbar);

// Menu
webix.protoUI({
  name:"Menu",
  defaults:{
    on:{
      onMenuItemClick: function(id, e, node) {
        var message = {};
        message.FormID    = this.config.formID;
        message.Command   = this.getMenuItem(id).onMenuItemClickCommand;
        ServerCall(message);
      }
    }
  }
}, webix.ui.menu);

// Menu
webix.protoUI({
  name:"ContextMenu",
  defaults:{
    on:{
      onItemClick: function(id, e, node) {
        var message = {};
        message.FormID    = this.config.formID;
        message.Command   = this.getItem(id).command;
        ServerCall(message);
      }
    }
  }
}, webix.ui.contextmenu);

// Button
webix.protoUI({
  name:"Button",
  $init:function(config) {
    this.$view.className += " webix_el_button";
  },
  defaults:{
    on:{
      onItemClick: function(id, e) {
        var message = {};
        message.FormID    = this.config.formID;
        message.Command   = this.config.onItemClickCommand;
        ServerCall(message);
      }
    }
  }
}, webix.ui.button);

// Text
webix.protoUI({
  name:"Text",
  $init:function(config) {
    this.$view.className += " webix_el_text";
    if(config.suggest) {
      config.suggest += '&formID=' + config.formID;
      config.suggest += '&viewID=' + config.id;
      config.suggest += '&viewName=' + config.name;
    }

    // this.$ready.push(this._Init);
    // this.$ready.unshift(this._after_init_call);
  },
  _Init: function () {
    if(this.config.dataSchema) {
      console.dir(this.config);
      this.config.suggest += '&formID=' + this.config.formID;
      this.config.suggest += '&viewID=' + this.config.id;
      this.config.suggest += '&viewName=' + this.config.name;
    }
  },
  _after_init_call: function () {
    // if(this.config.dataSchema) {
    //   console.dir(this.config);
    //   this.config.suggest += '&formID=' + this.config.formID;
    //   this.config.suggest += '&viewID=' + this.config.id;
    //   this.config.suggest += '&viewName=' + this.config.name;
    // }
  },
  defaults:{
    on:{
      onChange: function(newv, oldv) {
        var message = {};
        message.FormID    = this.config.formID;
        message.Command   = 'MasterChenged';
        message.Property  = this.config.name;
        message.Value     = newv;
        ServerCall(message);
      }
    }
  }
}, webix.ui.text);

// // Label
webix.protoUI({
  name:"label",
  $init:function(config) {
    //this.$view.className += " webix_el_button";
  },
  defaults:{
    on:{
      onItemClick: function(id, e) {
        var message = {};
        message.FormID    = this.config.formID;
        message.Command   = this.config.onItemClickCommand;
        ServerCall(message);
      }
    }
  }
}, webix.ui.label);

// Text
webix.protoUI({
  name: "Checkbox",
  $init:function(config) {
    this.$view.className += " webix_el_checkbox";
  },
  defaults:{
    on:{
      onChange: function(newv, oldv) {
        var message = {};
        message.FormID    = this.config.formID;
        message.Command   = this.config.onChange;
        message.Value     = newv;
        ServerCall(message);
      }
    }
  }
}, webix.ui.checkbox);

// Dataview
webix.protoUI({
  name:"Dataview",
  defaults:{
    on:{
      onSelectChange: function(id, e, node) {
        if(!Array.isArray(id)) {
          this.lastSelected = {id: id, index: this.getIndexById(id)};
        }
        // console.log(id);
        if (id) {
          var message = {};
          message.AppID      = window.ApplicationID;
          message.FormID     = this.config.formID;
          message.ViewID     = this.config.id;
          message.ViewName   = this.config.name;
          message.dynamic    = this.config.dynamic;
          message.Command    = this.config.onSelectChangeCommand;
          message.ItemID     = id;
          // message.ItemIndex  = this.getIndexById(id);
          ServerCall(message);
        }
      },
      onItemDblClick: function(id, e, node) {
        if (id) {
          var message = {};
          message.AppID      = window.ApplicationID;
          message.FormID     = this.config.formID;
          message.Command    = this.config.onItemDblClickCommand;
          message.DataSchema = this.config.dataSchema;
          message.Value      = this.getItem(id);
          ServerCall(message);
        }
      },
      onItemClick: function(id, e, node){
        // console.dir(node);
      },
      onBeforeContextMenu: function(id){
          this.select(id);
      },
      focus:function(){
        webix.UIManager.setFocus(this);
      },
      onFocus: function(currentView) {
        subStringSearch.activeView = this;
      },
      onViewResize: function(data) {
        webix.message("Catch it!");
        webix.message(data);
      },
      resizeChildren: function(){
        console.log(5);
      },
      onAfterRender: function() {
        console.log(this.scrollPosition)
      },
      onBeforeContextMenu: function(id, event, target) {
        if (id) {
          var message = {};
          message.AppID      = window.ApplicationID;
          message.FormID     = this.config.formID;
          message.Command    = this.config.onBeforeContextMenuCommand;
          message.Value      = id;
          ServerCall(message);
        }
        
        // var contextmenu = webix.ui(menu);
        // contextmenu.define("master", this.$view);
      },
      onKeyPress: function(code, e) {
        function showSearchInput(self) {
          
          let container = self.$view;
          let searchInputDiv = document.createElement("DIV");
          searchInputDiv.className = "webix_view webix_control webix_el_text"; 
          let searchInput = document.createElement("INPUT");
          searchInput.setAttribute("type", "text");
          searchInput.className = "cubismo_search_input";
          searchInputDiv.appendChild(searchInput);
          container.appendChild(searchInputDiv);
          let closeButton = document.createElement("SPAN");
          searchInputDiv.appendChild(closeButton);
          closeButton.className = "webix_tab_close webix_icon fa-times"; 
          closeButton.setAttribute("role", "button");
          closeButton.setAttribute("aria-label", "Close search");
          closeButton.style.position = "relative";
          closeButton.style.top   = "-22px";
          closeButton.style.left  = "6px";
          closeButton.addEventListener("click", function(e) {
            removeSearchInput(self);
          });

          self.searchInput = searchInput;

          var offset = webix.html.offset(container);

          searchInputDiv.style.top   = (offset.y + offset.height - 33) + "px";
          searchInputDiv.style.left  = (offset.x + 4) + "px";
          searchInputDiv.style.width = (offset.width - 25) + "px";
          searchInputDiv.style.height = "30px";
          searchInputDiv.style.position = "fixed";
          searchInputDiv.style.backgroundColor = "white";

          searchInput.style.width = (offset.width - 25) + "px";
        }

        function removeSearchInput(self) {
          if(self.searchInput && self.searchInput.parentElement) {
            self.searchInput.parentElement.remove(); 
            self.searchInput = undefined;
            subStringSearch.subString = "";
            cancelLikeFilter(self);
          }
        }

        var key = e.keyCode || e.charCode;

        //console.log(e);
        if(key === 65 && e.ctrlKey) {
          this.selectAll();
          // e.preventDefault();
          return false;
        }

        if(key === 46) {
          const id = this.getSelectedId();
          if (id) {
            var message = {};
            message.AppID      = window.ApplicationID;
            message.FormID     = this.config.formID;
            message.Command    = this.config.onDelete;
            message.DataSchema = this.config.dataSchema;
            message.Value      = this.getItem(id);
            ServerCall(message);
          }
          return false;
        }

        if(!this.searchInput) {
          if(((key > 46 && key < 91) || (key > 96 && key < 112)) && e.key) {
            showSearchInput(this);
            this.searchInput.value += e.key;
          }
        } else {
          try {
            e.preventDefault();
            //console.log(e);
            if(key == 8 || key == 46) {
              this.searchInput.value = this.searchInput.value.slice(0, -1);
              subStringSearch.subString = this.searchInput.value;
              if(!this.searchInput.value) {
                removeSearchInput(this);
              }
              e.preventDefault();
              return;
            }

            if(key == 27) {
              removeSearchInput(this);              
              e.preventDefault();
              return;
            };

            if((key < 46 || (key > 91 && key < 96) || (key > 111 && key < 188)) && key != 32) {
              return;
            }

            this.searchInput.value += e.key;
            subStringSearch.subString = this.searchInput.value;
            this.focus();
            makeLikeFilter(this);
          } catch(error) {
            webix.message(error);
          }
        }
      }
    }
  },
  $init: function (config) {
    this.$ready.push(this._Init);
    this.$ready.unshift(this._after_init_call);
  },
  _after_init_call: function () {
    if(this.config.dataSchema) {
      this.config.url += JSON.stringify(this.config.dataSchema);
      this.config.url += '&formID=' + this.config.formID;
      this.config.url += '&viewID=' + this.config.id;
      this.config.url += '&viewName=' + this.config.name;
    }
  },
  _Init: function () {

    //hot keys for the component with 'details' ID
    // webix.UIManager.addHotKey("Ctrl+A", function() { 
    //   this.selectAll(); 
    //   return false; 
    // }, this); 

    if(this.config.dynamic && this.config.autoUpdate) {
      startUpdating(this.config);
    }

    if(this.config.contextmenu){
      var contextmenu = webix.ui(this.config.contextmenu);
      contextmenu.define("master", this.$view);
    }
  },
  focus:function(){
		webix.UIManager.setFocus(this);
	}
}, webix.ui.dataview);

// Datatable
webix.protoUI({
  name:"Datatable",
  defaults:{
    scroll: true,
    on:{
      onSelectChange: function() {
        if (id) {
          var message = {};
          message.AppID      = window.ApplicationID;
          message.FormID     = this.config.formID;
          message.ViewID     = this.config.id;
          message.ViewName   = this.config.name;
          message.dynamic    = this.config.dynamic;
          message.Command    = this.config.onSelectChangeCommand;
          message.ItemID     = id;
          // message.ItemIndex  = this.getIndexById(id);
          ServerCall(message);
        }
      },
      onItemDblClick: function(item) {
        var id = item.row;
        if (id) {
          var message = {};
          message.FormID    = this.config.formID;
          message.Command   = this.config.onItemDblClickCommand;
          message.Value     = this.getItem(id);
          ServerCall(message);
        }
      },
      onAfterAdd: function(id) {
        this.editCell(id,"Item");
        //this.getEditor().focus();
      },
      onAfterEditStop: function(values, editor, changed) {
        var message = {};
        message.FormID    = this.config.formID;
        message.ViewName  = this.config.name;
        message.Command   = 'MasterChenged';
        message.index     = this.getIndexById(editor.row);
        message.item      = this.getItem(editor.row);
        message.Property  = editor.column;
        message.Values    = values;
        ServerCall(message);
      },
      onBeforeLoad: function() {
      },
      onAfterLoad: function() {
      }
    }
  },
  $init: function (config) {
    this.$ready.push(this._Init);
    this.$ready.unshift(this._after_init_call);
  },
  _after_init_call: function () {
    if(this.config.dataSchema) {
      this.config.url += JSON.stringify(this.config.dataSchema);
      this.config.url += '&formID=' + this.config.formID;
      this.config.url += '&viewID=' + this.config.id;
      this.config.url += '&viewName=' + this.config.name;
    }
  },
  _Init: function () {
    if(this.config.dynamic && this.config.autoUpdate) {
      startUpdating(this.config);
    }
  },
  focus:function(){
		webix.UIManager.setFocus(this);
	}
}, webix.ui.datatable);

// List
webix.protoUI({
  name:"List",
  formID: "ID",
  defaults:{
    scroll: true,
    on:{
      onSelectChange: function(id) {
        if (id) {
          var message = {};
          message.FormID    = this.config.formID;
          message.Command   = this.config.command;
          message.Value     = this.getItem(id);
          ServerCall(message);
        }
      },
      onItemDblClick: function(id) {
        if (id) {
          var message = {};
          message.FormID    = this.config.formID;
          message.Command   = this.config.onItemDoubleClickCommand;
          message.Value     = this.getItem(id);
          ServerCall(message);
        }
      },
      onAfterAdd: function(id, index) {
        if (id) {
          var message = {};
          message.FormID    = this.config.formID;
          message.Command   = this.config.onAfterAddCommand;
          message.Value     = this.getItem(id);
          ServerCall(message);
        }
      },
      onAfterDelete: function(id) {
        if (id) {
          var message = {};
          message.FormID    = this.config.formID;
          message.Command   = this.config.onAfterDeleteCommand;
          message.Value     = id;
          ServerCall(message);
        }
      }
    }
  }
}, webix.ui.list);

// Tree
webix.protoUI({
  name:"Tree",
  treeType: true,
  defaults:{
    scroll: true,
    on:{
      onSelectChange: function(id) {
        if (id) {
          var message = {};
          message.AppID      = window.ApplicationID;
          message.FormID     = this.config.formID;
          message.ViewID     = this.config.id;
          message.ViewName   = this.config.name;
          message.dynamic    = this.config.dynamic;
          message.Command    = this.config.onSelectChangeCommand;
          message.ItemID     = id;
          // message.ItemIndex  = this.getIndexById(id);
          ServerCall(message);
        }
      },
      onItemDblClick: function(id) {
        if (id) {
          var message = {};
          message.FormID    = this.config.formID;
          message.Command   = this.config.onItemDoubleClickCommand;
          message.Value     = this.getItem(id);
          ServerCall(message);
        }
      },
      onAfterLoad: function() {
        var message = {};
        message.FormID    = this.config.formID;
        message.Command   = this.config.onAfterLoad;
        ServerCall(message);
      }
    }
  },
  $init: function (config) {
    this.$ready.push(this._Init);
    this.$ready.unshift(this._after_init_call);
  },
  _after_init_call: function () {
    if(this.config.dataSchema) {
      this.config.url += JSON.stringify(this.config.dataSchema);
      this.config.url += '&formID=' + this.config.formID;
      this.config.url += '&viewID=' + this.config.id;
      this.config.url += '&viewName=' + this.config.name;
    }
  },
  _Init: function () {
    if(this.config.dynamic && this.config.autoUpdate) {
      startUpdating(this.config);
    }
  },
  focus:function(){
		webix.UIManager.setFocus(this);
	}
}, webix.ui.tree);

// Treetable
webix.protoUI({
  name:"Treetable",
  defaults:{
    scroll: true,
    on:{
      onItemClick: function(item) {
        if (item) {
          var message = {};
          message.AppID      = window.ApplicationID;
          message.FormID     = this.config.formID;
          message.ViewID     = this.config.id;
          message.ViewName   = this.config.name;
          message.dynamic    = this.config.dynamic;
          message.Command    = this.config.onSelectChangeCommand;
          message.ItemID     = item.row;
          message.Value       = item.row;
          ServerCall(message);
        }
      },
      onItemDblClick: function(item) {
        var id = item.row;
        if (id) {
          var message = {};
          message.FormID    = this.config.formID;
          message.Command   = this.config.onItemDblClickCommand;
          message.Value     = this.getItem(id);
          ServerCall(message);
        }
      },
      onBeforeLoad: function() {
      },
      onAfterLoad: function() {
         if(this.scrollPosition && this.scrollPosition.neededToScrol) {
          restoreScrollPosition(this, this.scrollPosition.scPos, this.scrollPosition.selectedItemId, this.scrollPosition.selectedItemIndex);
          this.scrollPosition.neededToScrol = false;
        }
        var message = {};
        message.FormID    = this.config.formID;
        message.Command   = this.config.onAfterLoad;
        ServerCall(message);
      },
      onBeforeOpen: function(id) {
        if (this.getItem(id).$count === -1)
          this.loadBranch(id, null, this.config.url);
      },
      onAfterSelect: function(item) {
        var message = {};
        message.AppID      = window.ApplicationID;
        message.FormID     = this.config.formID;
        message.ViewID     = this.config.id;
        message.ViewName   = this.config.name;
        message.dynamic    = this.config.dynamic;
        message.Command    = this.config.onSelectChangeCommand;
        message.ItemID     = item.row;
        message.Value      = item.row;
        ServerCall(message);
      },
      onBeforeContextMenu: function(item, node, target) {
        
        if (item) {
          this.select(item.row);

          var message = {};
          message.AppID      = window.ApplicationID;
          message.FormID     = this.config.formID;
          message.Command    = this.config.onBeforeContextMenuCommand;
          message.Value      = item;
          ServerCall(message);
        }

        var contextmenu = $$(this.config.formID + "_context");
        if(contextmenu) {
          contextmenu.destructor();
        }

        if(this.config.contextmenu && this.config.contextmenu[item.row]) {
          contextmenu = webix.ui(this.config.contextmenu[item.row]);
          contextmenu.define("master", this.$view);
          contextmenu.show(node);
          return false;
        } 
      },
    }
  },
  $init: function (config) {
    this.$ready.push(this._Init);
    this.$ready.unshift(this._after_init_call);
  },
  _after_init_call: function () {
    if(this.config.dataSchema) {
      this.config.url += JSON.stringify(this.config.dataSchema);
      this.config.url += '&formID=' + this.config.formID;
      this.config.url += '&viewID=' + this.config.id;
      this.config.url += '&viewName=' + this.config.name;
    }
  },
  _Init: function () {
    if(this.config.dynamic && this.config.autoUpdate) {
      startUpdating(this.config);
    }
  },
  focus:function(){
		webix.UIManager.setFocus(this);
  },
 // onContext: function() {},
}, webix.ui.treetable);

// Tree
webix.protoUI({
  name: "sidebar",
  defaults:{
    on:{
      onItemClick: function(id) {
        if (id) {
          var message = {};
          message.FormID    = this.config.formID;
          message.Command   = this.config.onItemClickCommand;
          message.Value     = this.getItem(id);
          ServerCall(message);
        }
      }
    }
  }
}, webix.ui.sidebar);

// Richselect
webix.protoUI({
  name:"Richselect",
   $init:function(config) {
    this.$view.className += " webix_el_richselect";
  },
  defaults:{
    on:{
    }
  }
}, webix.ui.richselect);

// Uploader
webix.protoUI({
  name:"Uploader",
  $init:function(config) {
    this.$ready.push(this._init);
  },
  _init:function() {
    var uploader = this;
    this.files.attachEvent("onAfterDelete", function (id){
      var message = {};
      message.FormID    = uploader.config.formID;
      message.Command   = uploader.config.onAfterDeleteCommand;
      message.Value     = id;
      ServerCall(message);
    }),
    this.files.attachEvent("onBeforeDelete", function (id){
      console.log(uploader)
      var message = {};
      message.FormID    = uploader.config.formID;
      message.Command   = uploader.config.onBeforeDeleteCommand;
      message.Value     = this.getItem(id);
      ServerCall(message);
    })
  },
  defaults:{
    scroll: true,
    on:{
      onFileUpload: function(item, response){
        var id = item.id;
        var row = $$(this.config.link).getItem(id);
        row.fullPathFile = response.fullPathFile;
      },
      onAfterFileAdd: function(file) {
        if (file) {
          let item = {};
          Object.assign(item, file);
          delete item.file;
          var message = {};
          message.FormID    = this.config.formID;
          message.Command   = this.config.onAfterFileAddCommand;
          message.Value     = item;
          ServerCall(message);
        }
      }
    }
  }
}, webix.ui.uploader);

// JSONViewer
webix.protoUI({
  name: "JSONViewer",
  render: function(json, level) {
    if(!level) {
      level = 1;
    }
    let div = document.createElement("DIV");
    div.className = "JSONViewer"
    this.getNode().appendChild(div);
    div.appendChild(
      renderjson.set_show_to_level(level)(json)
    );
  }
}, webix.ui.view);

// HTMLblock
webix.protoUI({
  name:"HTMLblock"
}, webix.ui.layout);

// iFrame
webix.protoUI({
  name:"iFrame"
}, webix.ui.iframe);


// RichText
webix.protoUI({
	name:"RichText",
	defaults:{
		config:{ buttonList:['fontSize','bold','italic','underline','strikeThrough','subscript','superscript'] },
		value:""
	},
	$init:function(config){
		this.$view.innerHTML = "<div style='padding:10px'> </div>";
		this.$view.className += " webix_selectable";

		this._waitEditor = webix.promise.defer();
		this.$ready.push(this._render_nic_editor);
	},
	_render_nic_editor:function(){
		webix.require("/js/nicEdit.js", function(){
			if (!this._editorCss){
				webix.html.addStyle(".nicEdit-panel{height:22px}\n.nicEdit-panelContain{border-top-width:0px !important;}");
				this._editorCss = true;
			}
			
			this.config.config.iconsPath = webix.codebase+"/js/nicEditorIcons.gif";

			var nic = new nicEditor(this.config.config).panelInstance(this.$view.firstChild);
			this._3rd_editor = nic.nicInstances[nic.nicInstances.length-1];
			this._set_inner_size();
			
			///////
      nic.id = this.config.id;
      this.oldValue = this.config.value;
      var editorID = nic.id;
      //webix.message("nic id: " +editorID);
			nic.addEvent('blur', function() {
        //webix.message("aditor id: " +editorID);
        //onRichTextBlur(editorID);
        
        var editor = $$(editorID);
        if(editor) {
          var newValue = editor.getValue();
          if(editor.oldValue !== newValue) {
            editor.oldValue = newValue;
            var message = {};
            message.FormID    = editor.config.formID;
            message.Command   = 'MasterChenged';
            message.Property  = editor.config.name;
            message.Value     = newValue;
            ServerCall(message); 
          }
        }
			});
			////

			this._waitEditor.resolve(this._3rd_editor);
			
			this.setValue(this.config.value);
			if (this._focus_await)
				this.focus();
		}, this);
	},
	_set_inner_size:function(){
		if (!this._3rd_editor || !this.$width) return;

		var editor = this.$view.firstChild;
		editor.style.width = this.$width+"px";

		editor = editor.nextSibling;
		editor.style.width = this.$width-20+"px";	//2x10 - padding
		editor.style.height = this.$height-46+"px";	//2x10 padding + 26 - header with borders
	},
	$setSize:function(x,y){
		if (webix.ui.view.prototype.$setSize.call(this, x, y)){
			this._set_inner_size();
		}
	},
	setValue:function(value){
		this.config.value = value;
		if (this._3rd_editor)
			this._3rd_editor.setContent(value);
	},
	getValue:function(){
		return this._3rd_editor?this._3rd_editor.getContent():this.config.value;
	},
	focus:function(){
		this._focus_await = true;
		if (this._3rd_editor)
			this._3rd_editor.elm.focus();
	},
	getEditor:function(waitEditor){
		return waitEditor?this._waitEditor:this._3rd_editor;
	}
}, webix.ui.view);


function onRichTextBlur(ViewID) {
  var editor = $$(ViewID);
  var newValue = editor.getValue();
  if(editor.oldValue !== newValue) {
    editor.oldValue = newValue;
    var message = {};
    message.FormID    = editor.config.formID;
    message.Command   = 'MasterChenged';
    message.Property  = editor.config.name;
    message.Value     = newValue;
    ServerCall(message); 
  }
}

// Window
webix.protoUI({
  name:"Console",
  id: "Console",
  width:350,
  left:450, top:50,
  head: {
    view: "toolbar", margin: -4, 
          cols:[
            {view: "label", label: "Messages"},
            {},
            {view: "icon", icon: "close", click:"$$('Console').close();"}
          ]
  },
  body:{
    template:"Some text"
  },
  $init: function (config) {
    this.$ready.push(this._Init);
  },
  _Init: function () {

  }
}, webix.ui.window);

webix.protoUI({
  name:"jtext",
  $init:function(config) {
    this.$view.className += " webix_el_text";
  },
  $setSize:function(x,y) {
    webix.ui.text.prototype.$setSize.call(this, x, y);
    var parentBlock = this._parent_cell;
    if (parentBlock !== null) {
  	    setLabelWidth(parentBlock);
    }
  },
  defaults:{
    formID: "ID",
    on:{
      onChange: function(newValue, oldValue) {
        var message = {};
        message.controlID   = this.config.id;
        message.controlName = this.config.name;
        message.formID    = this.config.formID;
        message.event     = 'onChange';
        message.newValue  = newValue;
        message.oldValue  = oldValue;
        ServerCall(message);
      },
      onKeyPress: function(code, e) {
        var message = {};
        message.controlID   = this.config.id;
        message.controlName = this.config.name;
        message.formID    = this.config.formID;
        message.event     = 'onKeyPress';
        message.keyCode   = code;
        ServerCall(message);
      }
    }
  }
}, webix.ui.text);

webix.protoUI({
  name:"jtextarea",
  $init:function(config) {
    this.$view.className += " webix_el_textarea";
  },
  $setSize:function(x,y) {
    webix.ui.text.prototype.$setSize.call(this, x, y);
    var parentBlock = this._parent_cell;
    if (parentBlock !== null) {
  	    setLabelWidth(parentBlock);
    }
  }
}, webix.ui.textarea);

webix.protoUI({
  name:"jcounter",
  $init:function(config) {
    this.$view.className += " webix_el_counter";
  },
  $setSize:function(x,y) {
    webix.ui.text.prototype.$setSize.call(this, x, y);
    var parentBlock = this._parent_cell;
    if (parentBlock !== null) {
  	    setLabelWidth(parentBlock);
    }
  }
}, webix.ui.counter);

webix.protoUI({
  name:"jselect",
  $init:function(config) {
    this.$view.className += " webix_el_select";
  },
  $setSize:function(x,y) {
    webix.ui.select.prototype.$setSize.call(this, x, y);
    var parentBlock = this._parent_cell;
    if (parentBlock !== null) {
  	    setLabelWidth(parentBlock);
    }
  }
}, webix.ui.select);

// Datepicker
webix.protoUI({
  name:"Datepicker",
  $init:function(config) {
    this.$view.className += " webix_el_datepicker";
  }
}, webix.ui.datepicker);

webix.protoUI({
	name: "fullpage",
	defaults: {
    borderless: true,
		sections: []
	},
	$init: function(config){
    var self = this;
    config.fullpageConfig = this._buildPages(config);
    this.$view.innerHTML = config.fullpageConfig.sections;
    var fullPageMenu = document.createElement("DIV");
    fullPageMenu.setAttribute("id", "menu-container");
    document.body.appendChild(fullPageMenu);
    fullPageMenu.innerHTML += "<ul id='menu'>\n" + config.fullpageConfig.menuItems + "\n</ul>";
    console.log(fullPageMenu.innerHTML);

    setTimeout(function() {
      self._Init(config);
    }, 1);

    setTimeout(function() {
      self.$view.style.height = "100%";
    }, 1);
  },
	_Init: function(config){
		sections = new fullpage('#fullpage', {
      anchors: this.config.fullpageConfig.anchors,
      menu: '#menu',
      lazyLoad: true
    });
  },
  _buildPages: function(config) {
    var sections = [];
    var anchors = [];
    var menuItems = [];
    config.sections.forEach(section => {
      var sectionId = section.id;
      sections.push("<div class='section' id='" + sectionId + "'></div>");
      var anchor = sectionId + "_a";
      anchors.push(anchor);
      if(section.active) {
        menuItems.push('<li data-menuanchor="' + anchor + '" class="active"><a href="#' + anchor + '">' + section.menuTitle + '</a></li>');
      } else {
        menuItems.push('<li data-menuanchor="' + anchor + '"><a href="#' + anchor + '">' + section.menuTitle + '</a></li>');
      }
      
    });
    console.log(anchors);
    return { sections: "<div id='fullpage'>" + sections.join("\n") + "</div>", anchors: anchors, menuItems: menuItems.join("\n") };
  }
}, webix.ui.view);

function setLabelWidth(parentBlock) {
  
  var maxWidth = 0;
  
  var labels = parentBlock.$view.getElementsByTagName("label");
  for (var i=0; i < labels.length; i++) {
    if (isNaN(labels[i].clientWidth) == false) {
      maxWidth = Math.max(maxWidth, labels[i].clientWidth);
    }
  }
  
  for (var i=0; i < labels.length; i++) {
    if (isNaN(labels[i].clientWidth) == false) {
      try {
        labels[i].style.width = maxWidth + 'px';
      } catch(err) {
        console.log("Can't set width for " + labels[i].className);  
      }
    }
  }
  
  var boxBlocks = parentBlock.$view.getElementsByClassName('webix_el_box');
  for (var i=0; i < boxBlocks.length; i++) {
    var boxBlock = boxBlocks[i];
    var label = boxBlock.getElementsByTagName("label")[0];
    var input = boxBlock.getElementsByTagName("input")[0];
    if (input == undefined) {
      var input = boxBlock.getElementsByTagName("textarea")[0];
    }
    if (input == undefined) {
      var input = boxBlock.getElementsByTagName("select")[0];
    }
    if (input == undefined) {
      return;
    }
    
    if (input.className == 'webix_inp_counter_value') {
      input.style.width = '30px';
      continue;  
    }
    
    if (input !== undefined) {
      var boxBlockPadding = parseInt(window.getComputedStyle(boxBlock, null).getPropertyValue('padding-left').replace('px', '')) + parseInt(window.getComputedStyle(boxBlock, null).getPropertyValue('padding-right').replace('px', ''));
      input.style.width   = (boxBlock.clientWidth - label.clientWidth - boxBlockPadding) + 'px';
    }
  }
}

var dataUpdaters = {};

function dataUpdater(config) {
  var Config = config;
  this.config = config;
  this.update = function() {
    var control = $$(Config.id);
    if(control) {
      webix.ajax(control.config.url, function(response) {

        if(control.config.treeType) {
          var opendItems = control.getOpenItems();
        }

        var scPos = control.getScrollState();
        var selectedItemId = control.getSelectedId();
        if(Array.isArray(selectedItemId)) {
          selectedItemId = control.lastSelected.id;
          selectedItemIndex = control.lastSelected.index;
        } else {
          if(selectedItemId) {
            var selectedItemIndex = control.getIndexById(selectedItemId);
          } else {
            let firstId = control.getFirstId();
            if(firstId) {
              var selectedItemIndex = control.getIndexById(firstId);
            } else {
              selectedItemIndex = undefined;
            }
          }
        }
        control.clearAll();
        control.parse(response);

        if(opendItems) {
          for(let i=0; i<opendItems.length; i++) {
            control.scrollPosition = {
              scPos: scPos, selectedItemId: selectedItemId, selectedItemIndex: selectedItemIndex, neededToScrol: true
            }
            control.open(opendItems[i]);
          }
        } else {
          restoreScrollPosition(control, scPos, selectedItemId, selectedItemIndex);
        }
      });
    } else {
      clearInterval(dataUpdaters[config.id]);
    }
  }
}

function restoreScrollPosition(control, scPos, selectedItemId, selectedItemIndex) {
  control.scrollTo(scPos.x, scPos.y);
  //webix.message({text:"Refreshed", expire: 1000});
  if(control.exists(selectedItemId)) {
    control.select(selectedItemId);
  } else if(selectedItemIndex && control.getIdByIndex(selectedItemIndex)) {
    try {
      control.select(control.getIdByIndex(selectedItemIndex));
    } catch(error) {

    }  
  }
    else {
    var firstItemId = control.getFirstId();
    control.select(firstItemId);
  }
}

function startUpdating(config) {
  var updater = new dataUpdater(config);
  var updaterID = setInterval(updater.update, config.updateInterval * 1000);
  dataUpdaters[config.id] = updaterID;
}

function JSONToObject(Data) {
  return JSON.parse(Data, function(key, value) {
    if (typeof value === "string" &&
        value.startsWith("/Function(") &&
        value.endsWith(")/")) {
      value = value.substring(10, value.length - 2);
      return eval("(" + value + ")");
    }
    return value;
  })
}

var reconection = undefined;
var socket = {};

function reconnect() {
  if(!socket.connected) {
    //console.log(new Date())
    socket.connect({query: {WindowID: window.WindowID}});
  } else {
    clearInterval(reconection);
  }
}

socket = io({query: {WindowID: window.WindowID}});

socket.on('connect', function () {
//  console.log('connected ' + socket.id);
//  console.log('=======================');
});

socket.on('disconnect', function () {
  console.log('disconnected');
  reconection = setInterval(reconnect, 1000);
 });

function ServerCall(Message) {
  Message.appID = window.ApplicationID;;
  Message.User = User;
  scope.send(Message);
}

socket.on('dialog', function (params, callback) {
  if(params.type === "notify") {
    //webix.message("got notification")
    //var notification = new Notification("must work!");
    if(ipcRenderer) {
      const icon = window.location.href + params.options.icon;
      const sound = window.location.href + params.options.sound;
      ipcRenderer.send('async', {title: params.title, text: params.options.body, icon: params.options.icon, sound: params.options.sound});
      return;
    }
    if (("Notification" in window)) {
        delete params.options.sound;
        var notification = new Notification(params.title, params.options);
        notification.onclick = callback;
    } else {
      webix.message("No notifications")
    }
    return;
  }
  if(params.type === "waitingCursor") {
    if(params.config) {
      document.body.style.cursor = "progress";
    } else {
      document.body.style.cursor = "default";
    }
    return;
  }
  try {
    webix[params.type](params.config);
  } catch(error) {
    console.log(params.type);
    console.log(error);
  }
});

socket.on('message', function (msg, callback) {
  
  if(msg.directive == 'loadData') {
    $$(msg.controlID).$view.innerHTML = msg.data;
    $$(msg.controlID).refresh();
  } else if(msg.directive == 'newForm') {
    var $lasttab = $$(msg.containerID).addView(msg.data); 
    $$($lasttab).define("formID", msg.formID);
    $$($lasttab).show();
    $$("editor").focus();
    callback($lasttab);
  } else if(msg.directive == 'getValue') {
    let data = {value: $$(msg.controlID).getValue(), formID: msg.controlID}
    callback(data);

  } else if(msg.directive == 'GetValue') {
    let data = {value: $$(msg.controlID).getValue(), formID: msg.controlID}
    callback(data);

  } else if(msg.Directive == 'SetValue') {
      $$(msg.ViewID).setValue(msg.Value);
    
  } else if(msg.Directive == 'SetHTML') {
      $$(msg.ViewID).setHTML(msg.Value);
    

  } else if(msg.Directive == 'defineContextMenu') {
    const view = $$(msg.ViewID);
    if(!view) {
      return callback("Can't find view with ID " + msg.ViewID);
    }

    if(!view.config.contextmenu) {
      $$(msg.ViewID).config.contextmenu = {
        view: "ContextMenu",
        formID: view.config.formID,
        data:[]
      };
    }
    
    $$(msg.ViewID).config.contextmenu[msg.item] = msg.Value;

  } else if(msg.directive == 'closeForm') {
    $$("Forms").removeView(msg.formID);
  } else if(msg.directive == 'add') {
    var data = {};
    for(let key in msg.data) {
      Object.defineProperty(data, key, {value: msg.data[key], enumerable: true});
    }
    $$(msg.controlID).add(data);
  } else if(msg.Directive == 'Remove') {
    try {
      $$(msg.ViewID).remove(msg.Item);
    } catch(error) {
      callback(error);
    }
    callback(null);
  } else if(msg.directive == 'getNextId') {
    let data = {value: $$(msg.controlID).getNextId(msg.data)};
    callback(data);
  } else if(msg.directive == 'getFirstId') {
    let data = {value: $$(msg.controlID).getFirstId(), formID: msg.formID};
    callback(data);
  } else if(msg.directive == 'select') {
    $$(msg.controlID).select(msg.data);
  } else if(msg.Directive == 'ClearAll') {
    $$(msg.ViewID).clearAll();
  } else if(msg.Directive == 'Add') {
    $$(msg.ViewID).add(msg.Value);

  } else if(msg.Directive == 'TreeAdd') {
    $$(msg.viewID).add(msg.item, msg.index, msg.ParentId);
    
  } else if(msg.Directive == 'TreeSelect') {
    $$(msg.viewID).select(msg.itemId);
    
  } else if(msg.Directive == 'RichselectAdd') {
    $$(msg.viewID).getList().add(msg.value);
    callback(null);
  } else if(msg.Directive == 'RichselectCurrentOption') {
    const value = $$(msg.viewID).getValue();
    callback(value);
    
  } else if(msg.Directive == 'RichselectSetCurrentOption') {
    $$(msg.viewID).setValue(msg.value);
    callback(null);
    
  } else if(msg.directive == 'getList') {
    let data = {value: $$(msg.controlID).data.pull};
    callback(data);
  } else if(msg.Directive == 'GetSelectedItems') {
      let data = {};
      data.AppID      = window.ApplicationID;
      data.Value      = $$(msg.ViewID).getSelectedItem(true);
      callback(data);
      
  }
  else if(msg.Directive == 'GetItems') {
    if(msg.PropertiesFilter && msg.PropertiesFilter instanceof Array) {
      let data = $$(msg.ViewID).data;
      var items = [];
      if (data.each)
        data.each(function(obj) {
          let item = {};
          for( let key in obj) {
            if(msg.PropertiesFilter.includes(key)) {
              item[key] = obj[key];
            }
          }
          items.push(item);
        });
    } else {
      let items = $$(msg.ViewID).data.serialize();
    }
    callback(items);
  }
  else if(msg.Directive == 'AddForm') {
    var FormTab = {
      id: msg.ID,
      header: msg.Head, 
      close: true,
      body: JSONToObject(msg.Body)
    }
    var LastTabID = $$(msg.ViewID).addView(FormTab); 
    var LastTab = $$(LastTabID);
    LastTab.show();
    $$(msg.ViewID).removeView("dummy");
    callback(LastTabID);
    //socket.disconnect();
  }
    else if(msg.Directive == 'addPage') {
      var config = JSONToObject(msg.Body);
      var cell = document.getElementById(config.container).children[0];
      cell.setAttribute("id", config.container + "cell");
      config.container = config.container + "cell";
      webix.ui(config);
      callback();
    
  } else if(msg.Directive == 'ModalWindow') {
    var modalWindow = webix.ui({
      id: msg.ID,
      view: "window",
      head: 
        {
          view:"toolbar", margin: -4, 
          cols:[
            {view: "label", label: msg.Head ? msg.Head : "" },
            {},
            {view: "icon", icon: "close", click:"$$('" + msg.ID + "').close();"}
          ]
        },
      modal: true,
      move:false,
      position:"center",
      width: msg.Width,
      height: msg.Height, 
      body: JSONToObject(msg.Body)
    }).show();
  } else if(msg.Directive == 'SetSource') {
    var control = $$(msg.ViewID);
    control.define("src", msg.Source);
  } else if(msg.Directive == 'setContent') {
    var control = $$(msg.ViewID);
    control.define("src", msg.Source);
  } else if(msg.Directive == 'NewWindow') {
    var win = window.open(msg.URL, "Google Auth", 'width=800, height=600'); 
  } else if(msg.Directive == 'SetLabel') {
    var control = $$(msg.ViewID);
    control.config.label = msg.Value;
    control.refresh();
  } else if(msg.Directive == 'setCSS') {
    var control = $$(msg.ViewID);
    control.define("css", msg.Value);
    //control.config.css = msg.Value;
    control.refresh();
  } 

  else if(msg.directive == 'render') {
    var control = $$(msg.viewID);
    control.render(msg.value, msg.level);
  } 
  
  else if(msg.Directive == 'setStyle') {
    _error = null;
    try {
      var control = $$(msg.ViewID);
      if(msg.itemId) {
        var item = control.getItemNode(msg.itemId);
        item.style[msg.property] = msg.Value;
      } else {
        var element = control.getNode();
        element.style[msg.property] = msg.Value;
      }
    } catch(error) {
      _error = error;
    }
    callback(_error);
  } 
  
  else if(msg.Directive == 'GetValue') {
    let Value = $$(msg.ViewID).getValue();
    callback(Value);
  } else if(msg.Directive == 'Message') {
    webix.message({text:msg.Value, expire: 1000});
    callback(null);
  } else if(msg.Directive == 'Refresh') {
    var Updater = new dataUpdater($$(msg.ViewID).config);
    Updater.update();
    callback(null);
    
  }else if(msg.Directive == 'Close') {
    if($$(msg.ContainerID).close) {
      $$(msg.ContainerID).close();
    } else {
      $$('FormsBar').removeView(msg.ContainerID)
    }
  } else if(msg.Directive == 'OpenFile') {
    if(window.Environment == 'client') {
      try {
        shell.openItem(msg.FileName);
      } catch(Err) {
        shell.openExternal(window.location + '/files?fileName=' + msg.FileName);
      }
    } else {
      var NewWindow = window.open(window.location + '/files?fileName=' + msg.FileName);
    }
  } else if(msg.directive == 'moveToSection') {
    sections.moveTo(msg.sectionId + '_a');
    callback(null);
  } 
});

// socket.on('roster', function (names) {
//   $scope.roster = names;
//   $scope.$apply();
// });

var scope = {
  send: function send(message) {
  //console.log('Sending message:', message.text);
  socket.emit('message', message, window.WindowID);
}}

// $scope.setName = function setName() {
//   socket.emit('identify', $scope.name);
// };


 function initApp(appId) {

  window.ApplicationID = appId;

  webix.ajax(
    "?appID=" + appId + "&isWindow=1&environment=" + window.Environment, 
    function(data){
      webix.ui(JSONToObject(data));
    }
  );
   
 }