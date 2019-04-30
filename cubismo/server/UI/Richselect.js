/* globals Form UIElement */

UIElement.AddOption = function(Value, callback) {
  
   function mainFunction(callback) {
      var Message = {};
      Message.Directive = 'RichselectAdd';
      Message.viewID    = UIElement.View.id;
      Message.value     = Value;
      Form.Client.emit('message', Message, function() {
        return callback(null);
      });
   }
  
  if (callback) {
    return mainFunction(callback);
  }
  
  return new Promise(function(resolve, reject) {
    mainFunction(function (error, result) {
      error ? reject(error) : resolve(result);
    });
  });
}

UIElement.CurrentOption = function(callback) {
  
  function mainFunction(callback) {
    var Message = {};
    Message.Directive = 'RichselectCurrentOption';
    Message.viewID    = UIElement.View.id;
    Form.Client.emit('message', Message, function(response) {
      return callback(null, response);
    });
  }
  
  if (callback) {
    return mainFunction(callback);
  }
  
  return new Promise(function(resolve, reject) {
    mainFunction(function (error, result) {
      error ? reject(error) : resolve(result);
    });
  });
  
}

UIElement.SetCurrentOption = function(value, callback) {
  
  function mainFunction(callback) {
    var Message = {};
    Message.Directive = 'RichselectSetCurrentOption';
    Message.viewID    = UIElement.View.id;
    Message.value     = value;
    Form.Client.emit('message', Message, function(response) {
      return callback(null, response);
    });
  }
  
  if (callback) {
    return mainFunction(callback);
  }
  
  return new Promise(function(resolve, reject) {
    mainFunction(function (error, result) {
      error ? reject(error) : resolve(result);
    });
  });
  
}