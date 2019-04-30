/* globals Tools Form UIElement */

UIElement.AddForm = function(NewForm, FormView, ContainerID, callback) {
    var Message = {};
    Message.Directive = 'AddForm';
    Message.ViewID    = Form.FormsBar.View.id;
    Message.ID        = ContainerID;
    Message.Head      = FormView.header;
    Message.Body      = Tools.ObjectToJSON(FormView);
    
    Application.Window().Client.emit('message', Message, function(ContainerID) {
      NewForm.ContainerID = ContainerID;
      if(callback) {
        callback();
      }
    });
}