function init(platform, server) {
  var socketio = require("socket.io");
  var io = {};

  const applications = [];

  const args = process.argv;
  if(args && args.length > 2) {
    for(let i=2; i<args.length; i++) {
      const appId = args[i];
      const application = platform.applications[appId];
      if(!application) {
        platform.initApplication(appId)
        .then(app => {
          applications.push(app);
        });
      }
    }
  }

  io = socketio.listen(server);

  io.on('connection', function (socket) {

    function setEnvVariables(params) {
      process.env.APP    = params.applicationId;
      process.env.WINDOW = params.windowId;
      process.env.TOKEN  = params.token;
      process.env.LANG   = params.lang;
    }

    async function sendViewConfig() {
      const application = platform.application;
      if(application) {
        const index = _.findIndex(applications, ["name", application.name]);
        if(~index) {
          applications[index] = application;
        } else {
          applications.push(application);
        }
        let authorized = false;
        try {
          authorized= await platform.authorized();
        } catch(err) {

        }
        if(authorized) {
          const view = await application.show(socket);
          socket.emit("window", view, "LoginBox");
        } else {
          const view = require('../client/views/login.json');
          socket.emit("window", view, "LoginBox");
        }
      }
    }

    setEnvVariables(socket.handshake.query);
    
    Log.debug(`Client for application <${process.env.APP}> is connected`);

    if(process.env.APP === "index") {
      // sumbody is knoking, so let wait
    } else {
      sendViewConfig();
    }

    console.log("connected")

    socket.on('login', function (message, callback) {
      setEnvVariables(message);
      sendViewConfig();
    });

    socket.on('refreshToken', async function (message, callback) {
      Log.debug(`Trying to refresh token`);
      setEnvVariables(message);
      callback(await platform.refreshToken(message.token));
    });

    socket.on('error', function (Err) {
      console.log('socket.io gave error = > ' + Err);
    });
    
    socket.on('disconnect', function () {
      //sockets.splice(sockets.indexOf(socket), 1);
    });

    socket.on("index", (message, callback) => {
      if(!message.clientId) {
        return;
      }
      applications.forEach(app => {
        const subscriber = _.get(app, "_.clientSubscribers." + message.clientId);
        if(subscriber) {
          subscriber.connect(socket);
        }
      });
    });

    socket.on('getData', async function (message, callback) {
      setEnvVariables(message);

      const application = getApplication(message);
      const view        = getView(message, application);
      const uiElement   = getUIElement(message, view);

      const queryString = uiElement.config.query;
      if(typeof queryString === "string" && queryString.includes("function")) {
        const query = queryString.split(".");
        if(query[1] === "view") {
          const procedure = query[2];
          if(procedure) {
            const eventHandler = view[procedure];
            if(eventHandler) {
              try {
                const data = await view[procedure]();
                callback(null, data);
              } catch(err) {
                Log.error("Error on handling UI element event", err);
              }
            } else {
              const err = "Can't find method <" + message.event.procedure + ">.";
              if(callback) {
                callback(err);
              } else { 
                return Log.error(err);
              }
            }
          } else {
            // missing handler is not an error
          }
        }
      } else {
        const map = uiElement.config.query.map;
        application.Query.execute(queryString, undefined, uiElement)
        .then(result => {
          const data = _.makeHierarchical(result[0], "parentId", "data", map);
          callback(null, data);
        })
        .catch(err => {
          callback(err)
        })
      }
    });

    socket.on('localaze', function (message, callback) {
      setEnvVariables(message);

      const application = getApplication(message);
      const view        = getView(message, application);
      const uiElement   = getUIElement(message, view);
      let item          = view.item;

      if(message.collection) {
        const collection = _.get(view, message.collection);
        item = collection[message.index]
      }

      const translations = message.translations;
      if(translations && translations.length) {
        translations.forEach(translation => {
          const newValue = { value: translation.value, itWasChangerdOnClient: true };
          item.setValue(translation.attribute, newValue, translation.lang);
          //item.setValue(translation.attribute, translation.value, translation.lang);
        })
      }
    });

    socket.on('getLocal', function (message, callback) {
      setEnvVariables(message);

      const application = getApplication(message);
      const view        = getView(message, application);
      let item          = view.item;

      if(message.collection) {
        const collection = _.get(view, message.collection);
        item = collection[message.index]
      }
    
      callback(null, item.getValue(message.attribute, message.lang));
    });

    socket.on('lookup', async function (message, callback) {
      setEnvVariables(message);

      const application = getApplication(message);
      const view = getView(message, application);
      const uiElement = getUIElement(message, view);
      let instance = message.arguments[0];

      let onlyFolders = uiElement.config.onlyFolders;
      const action = message.action;
      let directive = "setValue";

      function _setValue(value) {
        const propertyName = uiElement.config.dataLink.replace("item.", "");
        const newValue = { value: value, itWasChangerdOnClient: true };
        //view.item.setValue(propertyName, newValue);
        uiElement.value = newValue;
        if(!uiElement.config.events) {
          return;
        }
        const procedure = uiElement.config.events["onChange"];
        if(procedure) {
          const eventHandler = view[procedure];
          if(eventHandler) {
            try {
              view[procedure](value);
            } catch(err) {
                Log.error("Error on handling UI element event", err);
            }
          } else {
            const err = "Can't find method <onChange>.";
            if(callback) {
              callback(err);
            } else { 
              return Log.error(err);
            }
          }
        } else {
          // missing handler is not an error
        }
      }

      if(message.collection) {
        directive = "updateItem";
        var target = _.get(view, uiElement.config.dataLink);
        if(target && target.length) {
          item = target[message.index];
          item.view = view;
          instance = message.arguments[0];
          onlyFolders = false;
          //_setItemValue(item, value);
          //return;
        } else {
          Log.error("Collection <" + uiElement.config.dataLink + "> doesn't have rows!");
        }

        if(_.has(uiElement, "config.events.onLookup")) {
          const procedure = uiElement.config.events["onLookup"];
          if(procedure) {
            const eventHandler = view[procedure];
            if(eventHandler) {
              try {
                view[procedure]({
                  element: uiElement,
                  item: item,
                  attribute: message.property
                });
              } catch(err) {
                  Log.error("Error on handling UI element event", err.stack);
              }
            } else {
              const err = "Can't find method <onLookup>.";
              if(callback) {
                callback(err);
              } else { 
                return Log.error(err);
              }
            }
          } else {
            // missing handler is not an error
          }
          return;
        }
      }

      if(action === "clear") {
        _setValue(null);
        //uiElement.value = null;
        return;
      } 

      options = {
        purpose: "select",
        caller: view,
        onlyFolders: onlyFolders
      }
      const type = _.getPropertyByTrack(application, instance.model);
      if(type._.model.definition.owners && type._.model.definition.owners.length) {
        options.owner = item;
      }

      type.show({options})
        .then(value => {
          let _arguments;
          if(directive === "updateItem") {
            item[message.property] = value;
            _arguments = [message.itemId, item.toJSON() ]
          } else {
            const newValue = { 
              id: value.getValue("id"),
              presentation: value.getValue("Name"),
              model: value._.model.name
            }
            _arguments = [newValue]
          }
          const _message = {
            directive: directive,
            elementId: uiElement.config.id,
            itemId: message.itemId,
            arguments: _arguments
          }
          socket.emit("directive", _message, function(response) {
            if (response.err) {
              Log.error("Unsuccessable atempt to change value of " + uiElement.name, response.err);
            } else {
              _setValue(value);
            }
          });
        })
        .catch(err => {
          Log.error("Error on looking up for " + uiElement.name, err);
        })
    });

    function getApplication(message) {
      let application = platform.applications[message.applicationId];
      if(message.applicationId === "index" || !application && message.clientId) {
        applications.forEach(app => {
          const subscriber = _.get(app, "_.clientSubscribers." + message.clientId);
          if(subscriber) {
            application = app;
          }
        });
      }
      if(!application) {
        const err = "Application <" + message.applicationId + "> is not defined.";
        if(err) {
          return Log.error(err)
        }
      } else {
        return application;
      }
    }

    function getView(message, application) {
      const view = application.views[message.viewId];
      if(!view) {
        const err = "View with ID <" + message.viewId + "> is not defined.";
        if(err) {
          return Log.error(err)
        }
      } else {
        return view;
      }
    }

    function getUIElement(message, view) {
      let uiElement = view[message.element];
      if(message.owner) {
        if(message.owner.includes(".")) {
          const ownerPath = message.owner.split(".");
          if(ownerPath.length = 2) {
            uiElement = view[ownerPath[0]][ownerPath[1]];
          }
        } else {
          uiElement = view[message.owner];
        }
      }
      if(!uiElement) {
        const err = "UI element with name <" + message.element + "> is not defined.";
        if(err) {
          return Log.error(err)
        }
      } else {
        return uiElement;
      }
    }

    socket.on('event', function (message, callback) {
      setEnvVariables(message);

      const application = getApplication(message);
      const view        = getView(message, application);
      const uiElement   = getUIElement(message, view);

      const window = application.views[process.env.WINDOW];
      window._.client = socket;

      const _arguments = message.arguments || [];
      if(typeof callback === "function") {
        _arguments.push(callback);
      }
      if(uiElement[message.element]) {
        uiElement[message.element](_arguments[0], _arguments[1], _arguments[2], _arguments[3], _arguments[4]);
        return;
      }

      // if(uiElement[message.event]) {
      //   uiElement[message.event](_arguments[0], _arguments[1], _arguments[2], _arguments[3], _arguments[4]);
      //   return;
      // }

      if(message.event === "onLoad") {
        if(view.onLoad) {
          view.onLoad();
        }
        return;
      }

      if(message.event === "onChange") {
        let newValue;
        if(uiElement.config.dataLink.includes("variables")) {
          newValue = _arguments[0];
          view._.variables[uiElement.config.dataLink.replace("variables.","")] = newValue;
        } else {
          newValue = { value: _arguments[0], itWasChangerdOnClient: true };
          uiElement.value = newValue;
        }
      }

      if(message.event === "onItemChange") {
        var target = _.get(view, uiElement.config.dataLink);
        if(target && target.length) {
          var item = target[_arguments[1]];
          const fieldId = _arguments[0];
          item.setValue(fieldId, _arguments[3]);
        } else {
          Log.error("Collection <" + uiElement.config.dataLink + "> doesn't have rows!");
        }
      }

      const procedure = _.get(uiElement.config, "events." + message.event) || message.event;
      if(procedure) {
        const eventHandler = view[procedure];
        if(eventHandler) {
          try {
            view[procedure](_arguments[0], _arguments[1], _arguments[2], _arguments[3], _arguments[4]);
          } catch(err) {
            if(callback) {
              callback(err);
            } else { 
              Log.error("Error on handling UI element event", err);
            }
          }
        } else {
          const err = "Can't find method <" + message.event.procedure + ">.";
          if(callback) {
            callback(err);
          } else { 
            return Log.error(err);
          }
        }
      } else {
        // missing handler is not an error
      }

      if(uiElement[message.event]) {
        uiElement[message.event](_arguments[0], _arguments[1], _arguments[2], _arguments[3], _arguments[4]);
        return;
      }
    });

    socket.on('onBeforeViewClose', async function (message, callback) {
      setEnvVariables(message);

      const application = getApplication(message);
      const view        = getView(message, application);

      let close = true;
      if(view["onBeforeViewClose"]) {
        close = await view["onBeforeViewClose"]();
      }
      view.close();
      //callback(null, close);
    });

    socket.on('beforeunload', function (message, callback) {
      setEnvVariables(message);

      const application = getApplication(message);
      if(application) {
        delete application.views[message.windowId];
      }
    });
  });
  
  return io;
}
module.exports.init = init;