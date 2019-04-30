/* globals Tools UIElement */

UIElement.add = function(value, index, parentId, callback) {

  const mainFunction = function(callback) {
    const message = {
      directive: "add",
      elementId: UIElement.config.id,
      arguments: [value, index, parentId]
    }
    
    Application.window.directiveToClient("directive", message, function(response) {
      if(response.err) {
          callback(response.err);
      } else {
          callback(null, response.result);
      }
    })
  }
  
  if(callback) {
      return mainFunction(callback);
  }

  return new Promise(function(resolve, reject) {
      mainFunction(function(error, result) {
          error ? reject(error) : resolve(result);
      });
  });
}