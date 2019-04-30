/* globals Form UIElement */

UIElement.setValue = function(value) {

  const mainFunction = function(callback) {

    const message = {
      directive: "setValue",
      elementId: UIElement.config.id,
      arguments: [value]
    }
    
    Application.window._.client.emit("directive", message, function(response) {
      if(response.err) {
          callback(response.err);
      } else {
          callback(null);
      }
    })
  }

  return new Promise(function(resolve, reject) {
      mainFunction(function(error, result) {
          error ? reject(error) : resolve(result);
      });
  });
}