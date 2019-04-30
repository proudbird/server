UIElement.addView = function(view) {

  const mainFunction = function(callback) {

    const message = {
      directive: "addView",
      elementId: UIElement.config.id,
      arguments: [view.config]
    }
    
    Application.window.directiveToClient("directive", message, function(response) {
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