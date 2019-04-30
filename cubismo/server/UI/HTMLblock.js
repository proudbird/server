/* globals Form UIElement */

UIElement.SetValue = function(Value, callback) {
    var Message = {};
    Message.Directive = 'SetHTML';
    Message.ViewID    = UIElement.View.id;
    Message.Value     = Value;
    Form.Client.emit('message', Message, function(Response) {
      callback(Response);
    });
}