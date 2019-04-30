/* globals Tools Form UIElement */

UIElement.addView = function(config) {

    const mainFunction = function(callback) {

      const message = {
        directive: "addView",
        elementId: UIElement.config.id,
        arguments: [config]
      }
      
      Application.window._.client.emit("directive", message, function(response) {
        if(response.err) {
            callback(response.err);
        } else {
          config.tabId = response.result;
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

UIElement.removeView = function(id) {

    const mainFunction = function(callback) {

      const message = {
        directive: "removeView",
        elementId: UIElement.config.id,
        arguments: [id]
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

UIElement.setActiveIndex = function(index) {

  const mainFunction = function(callback) {

    const message = {
      directive: "setActiveIndex",
      elementId: UIElement.config.id,
      arguments: [index]
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