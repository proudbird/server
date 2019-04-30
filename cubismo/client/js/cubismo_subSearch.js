/* globals webix $$ */

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
            click:"$$('subStringSearchPopup').close(); subStringSearch.subString = '';"
          }
        ]
    }
  }

document.onkeydown = function(e) {
    var key = e.keyCode || e.charCode;

    if( key == 8 || key == 46 ) {
        subStringSearch.subString = subStringSearch.subString.slice(0, -1);
        $$("subStringSearchText").setValue(subStringSearch.subString);
        e.preventDefault();
        return false;
    };
};

document.onkeypress = function(e) {
  subStringSearch.subString += getChar(e);

  var pop = $$('subStringSearchPopup');
  if(!pop) {
    webix.ui(popup).show();
    var pop = $$('subStringSearchPopup');
  };
  $$("subStringSearchText").setValue(subStringSearch.subString);
  subStringSearch.activeView.focus();
  
  var offset = webix.html.offset(subStringSearch.activeView.getNode());
  $$('subStringSearchPopup').setPosition(offset.x+3, offset.y+offset.height-39);
  pop.$setSize(offset.width-6, 36);
  
  if(!subStringSearch.inProcess) {
    setTimeout(makeSubStrinSearch, 1000);
    subStringSearch.inProcess = true;
  }
}

function getChar(event) {
  if (event.which == null) { // IE
    if (event.keyCode < 32) return '';
    return String.fromCharCode(event.keyCode)
  }

  if (event.which != 0 && event.charCode != 0) {
    if (event.which < 32) return '';
    return String.fromCharCode(event.which);
  }

  return '';
}

function makeSubStrinSearch() {
  var message = {};
  message.FormID  = subStringSearch.activeView.config.formID;
  message.Command = 'SubStrinSearch';
  message.Value   = subStringSearch.subString;
  ServerCall(message);
  subStringSearch.inProcess = false;
}