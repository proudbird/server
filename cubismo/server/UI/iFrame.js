/* globals Form UIElement */

UIElement.NewWindo = function(Source) {
    var Message = {};
    Message.Directive = 'SetSource';
    Message.ViewID    = UIElement.View.id;
    Message.Source    = Source;
    Form.Client.emit('message', Message);
}


UIElement.setContent = function(value, callback) {
    var id = UIElement.View.formID + "-" + UIElement.View.name;
    Globals[id] = value;
    var Message = {};
    Message.Directive = 'SetSource';
    Message.ViewID    = UIElement.View.id;
    Message.Source    = Application.Name + '/tempData?appID=' + Application.ID + '&dataID='+id;
    Form.Client.emit('message', Message, function(Response) {
      callback(Response);
    });
}