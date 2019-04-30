/* globals Form UIElement */

UIElement.ClearAll = function(callback) {
    var Message = {};
    Message.Directive = 'ClearAll';
    Message.ViewID    = UIElement.View.id;
    Form.Client.emit('message', Message, function(Response) {
      callback(Response);
    });
}

UIElement.add = function(item, callback) {
  
  return new Promise(function (resolve, reject) {
    const itemData = item;
    const message = {
      directive: "add",
      elementId: UIElement.config.id,
      arguments: [itemData]
    }

    Application.window._.client.emit("directive", message, function(response) {
      if (response.err) {
        reject(error);
      } else {
        resolve(response.result);
      }
    })
  });
}

UIElement.selectByIndex = function(index) {
  
  return new Promise(function (resolve, reject) {
    const message = {
      directive: "selectByIndex",
      elementId: UIElement.config.id,
      arguments: [index]
    }

    Application.window._.client.emit("directive", message, function(response) {
      if (response.err) {
        reject(error);
      } else {
        resolve(response.result);
      }
    })
  });
}

UIElement.GetItems = function(PropertiesFilter, callback) {
    var Message = {};
    Message.Directive        = 'GetItems';
    Message.ViewID           = UIElement.View.id;
    Message.PropertiesFilter = PropertiesFilter;
    Form.Client.emit('message', Message, function(Response) {
      callback(Response);
    });
}

UIElement.setStyle = function(property, Value, id) {
  var Message = {};
  Message.Directive = 'setStyle';
  Message.ViewID    = UIElement.View.id;
  Message.property  = property;
  Message.Value     = Value;
  Message.itemId    = id;
  Form.Client.emit('message', Message, function(error) {
    if(error) {
      log("Unsucsesful atempt ot set element style for " + UIElement.Name, error);
    }
  });
}