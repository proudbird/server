/* globals __ROOT Tools Platform Application Forms FormName Cube ApplicationType Model*/
var Form = module.exports = {};
Form.ID = Tools.SID();
Form.Name = FormName;

var CallbackOnClose = undefined;

Form.Show = function(Params, Modal, WindowParams, callbackOnShow, callbackOnClose) {
  Platform.Forms[Form.ID] = Form;
  if(Form.Name != "Window") {
    if(!Tools.Window().Forms) {
      Tools.Window().Forms = {};
    }
    Tools.Window().Forms[Form.Name] = Form;
  }
  if(Params) {
    Form.Params = Params;
    Form.Instance = Params.Instance;
    if(Form.Instance) {
      Form.Instance.Form = Form;
    }
  }

  Form._callbackOnShow = callbackOnShow;
  Form._callbackOnClose = callbackOnClose;
  
  CallbackOnClose = callbackOnClose;

  var ContainerID = Tools.SID();
  Form.ContainerID = ContainerID;
  
  Platform.Applications.BindFormModule(FormName, Form.ID, Application, Cube, ApplicationType, Model);
    
  var LoadFunction = function() {
    var FormViewModule = Platform.Applications.LoadView(
            FormName, 
            Form.ID, 
            ContainerID, 
            Application.ID, 
            Cube,
            ApplicationType, 
            Model);

    if(Form.Params && Form.Params.purpose === "lookup") {
      var FormView = FormViewModule.Init(Form.Params.model, Form.Params.owner, Form.Params.instance);
    } else {
      var FormView = FormViewModule.Init(Form.Instance);
    }
    
    var Traverse = require('traverse');
    Traverse(FormView).map(function(Node) {
      if(Node && typeof Node != 'function')
      if (Node.view && Node.name && Node.name !== 'Form' && Node.name !== 'Window' && Node.name !== 'data') {
        var UIElement = Node;
        //console.log(Node.name)
        Object.defineProperty(Form, Node.name, {value: {}, enumerable: true});
        
        Object.defineProperty(Form[Node.name], 'View', {value: UIElement, enumerable: true});
        var dataValue = Tools.getPropertyByTrack(Form, Node.dataBind);
        if(dataValue) {
          Object.defineProperty(Form[Node.name], "data", {value: dataValue, enumerable: true});
        }
        var instance = Form[Node.name].View.instance;
        if(dataValue && instance) {
          var data = {id: instance.id, name: instance.Name};
          Form[Node.name].View.instance = data;
        }
        //console.log('===========')
        Platform.Applications.BindUIElementModule(Application, Form.ID, Node.name, UIElement.view);
      } else if(Node.view && Node.name && Node.name === 'Form' || Node.name === 'Window') {
        var UIElement = Node;
        Object.defineProperty(Form, 'View', {value: UIElement, enumerable: true});
        Platform.Applications.BindUIElementModule(Application, Form.ID, undefined, UIElement.view);
      }
    });

    if(Form.Params && Form.Params.purpose && Form.Params.purpose == "lookup") {
      FormView.purpose = "lookup";
    }
    
    if(!Modal) {
      if(FormName == 'Window') {
         return FormView;
      } else {
        Application.Window().FormsBar.AddForm(Form, FormView, ContainerID, callbackOnShow);
      }
    } else {
      var Message = {};
      Message.Directive = 'ModalWindow';
      Message.ID        = ContainerID;
      Message.Head      = WindowParams.Head;
      Message.Width     = WindowParams.Width;
      Message.Height    = WindowParams.Height;
      Message.Body      = Tools.ObjectToJSON(FormView);
      Application.Window().Client.emit('message', Message, function() {
        if(callbackOnShow) {
          callbackOnShow();
        }
      });
    }
  }
  
  if(Form.OnInit) {
    Form.OnInit(function() {
      return LoadFunction();
    });
  } else {
    return LoadFunction();
  }
}

Form.Close = function(Value, Params) {
  var Message = {};
  Message.Directive = 'Close';
  Message.ContainerID = Form.ContainerID;
  Form.Client.emit('message', Message);
  if(CallbackOnClose)
    CallbackOnClose(Value);
}

Form.Save = function() {
  Form.Instance.Save(Form.refresh());
}

Form.refresh = function() {
  if(!Form.Params.Caller) {return}
  const caller = Form.Params.Caller;
  for (const element in caller) {
    if(caller[element] && caller[element]["Refresh"]) {
      caller[element].Refresh();
    } 
  }
}

Form.OpenFile = function(Params) {
  var Message = {};
  Message.Directive = 'OpenFile';
  Message.FileName     = Params;
  Form.Client.emit('message', Message, function(Response) {
    callback(Response);
  });
}

Form.moveToSection = function(formName, callback) {
  var message = {};
  message.directive = 'moveToSection';
  message.sectionId  = Tools.Window().Forms[formName].View.container;
  Form.Client.emit('message', message, function(response) {
    if(callback) {
      callback(response);
    }
  });
}