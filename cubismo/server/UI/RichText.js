/* globals Form UIElement */

UIElement.GetValue = function(callback) {
    var Message = {};
    Message.Directive = 'GetValue';
    Message.ViewID    = UIElement.View.id;
    Form.Client.emit('message', Message, function(Response) {
      callback(Response);
    });
}

UIElement.SetValue = function(Value, callback) {
    var Message = {};
    Message.Directive = 'SetValue';
    Message.ViewID    = UIElement.View.id;
    Message.Value     = Value;
    Form.Client.emit('message', Message, function(Response) {
      callback(Response);
    });
}