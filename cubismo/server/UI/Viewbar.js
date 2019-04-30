/* globals Tools Form UIElement */

UIElement.addView = function(config, callback) {

    const mainFunction = function(callback) {

      var tabview = {
        header: config.header, 
        width: 200,
        close: true,
        body: config
      }

      const message = {
        directive: "addView",
        elementId: UIElement.config.id,
        arguments: [tabview]
      }
      
      Application.window.directiveToClient("directive", message, function(response) {
        if(response.err) {
            callback(response.err);
        } else {
          config.tabId = response.result;
            callback(null);
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

UIElement.removeView = function(id, callback) {

    const mainFunction = function(callback) {

      const message = {
        directive: "removeView",
        elementId: UIElement.config.id,
        arguments: [id]
      }
      
      Application.window.directiveToClient("directive", message, function(response) {
        if(response.err) {
            callback(response.err);
        } else {
            callback(null);
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