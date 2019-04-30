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
  UIElement.View.value = Value;
    var Message = {};
    Message.Directive = 'SetValue';
    Message.ViewID    = UIElement.View.id;
    Message.Value     = Value;
    Form.Client.emit('message', Message, function(Response) {
      callback(Response);
    });
}

UIElement.hide = async function () {

  return new Promise(function (resolve, reject) {
    const message = {
      directive: "hide",
      elementId: UIElement.config.id,
      arguments: []
    }

    Application.window._.client.emit("directive", message, async function (response) {
      if (response.err) {
        reject(error);
      } else {
        resolve(null);
      }
    })
  });
}

UIElement.show = async function () {

  return new Promise(function (resolve, reject) {
    const message = {
      directive: "show",
      elementId: UIElement.config.id,
      arguments: []
    }

    Application.window._.client.emit("directive", message, async function (response) {
      if (response.err) {
        reject(error);
      } else {
        resolve(null);
      }
    })
  });
}