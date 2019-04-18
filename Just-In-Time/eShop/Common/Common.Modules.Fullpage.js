Module.init= function (fullpage) {

  fullpage.addView = function(view) {

    const mainFunction = function(callback) {
  
      const message = {
        directive: "addView",
        elementId: fullpage.config.id,
        arguments: [view.config]
      }
      
      Cube.client.emit("directive", message, function(response) {
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

  fullpage.show = function(view) {

    const mainFunction = function(callback) {
  
      const message = {
        directive: "show",
        elementId: fullpage.config.id,
        arguments: []
      }
      
      Cube.client.emit("directive", message, function(response) {
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

  fullpage.moveToSection = function(sectionId) {

    const mainFunction = function(callback) {
  
      const message = {
        directive: "moveToSection",
        elementId: fullpage.config.id,
        arguments: [sectionId]
      }
      
      Cube.client.emit("directive", message, function(response) {
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
}