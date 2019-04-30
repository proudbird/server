/* globals $$ */
window.applicationId = window.location.pathname.replace("/", "") || "index";
let reconection;
const serverUrl = window.location.hostname + ":21021";
const server = io(serverUrl, {
  query: {
    applicationId: window.applicationId
  }
});

function reconnect() {
  if(!server.connected) {
    server.connect({
      query: {
        applicationId: window.applicationId
      }
    });
  } else {
    clearInterval(reconection);
  }
}

server.on('connect', function (response) {
  console.log("server is connected")
});

server.on('disconnect', function () {
  reconection = setInterval(reconnect, 1000);
 });

server.on("window", function (config) {
  webix.ui(
    JSON.parse(config, function(key, value) {
      if (typeof value === "string" &&
          value.startsWith("/Function(") &&
          value.endsWith(")/")) {
        value = value.substring(10, value.length - 2);
        return eval("(" + value + ")");
      }
      return value;
      }
    )
  );
});

server.on("ShowModalWindow", function (config, callback) {
  const options = {
    title: config.title,
    body: config,
    width: 600
  }
  const viewId = showModalWindow(options);
  callback(viewId);
});

server.on("CloseModalWindow", function (id, callback) {
  try {
    $$(id).close();
    callback({});
  } catch(err) {
    callback({ error: err });
  }
});

server.on("directive", function (message, callback) {
  const elementId = message.elementId;
  const element = $$(elementId);
  if(!element) {
    callback({ err: "No such element with ID <" + elementId + ">" });
  }
  const method = element[message.directive];
  if(!method) {
    callback({ err: "No such method <" + message.directive + "> for element with ID <" + elementId + ">" });
  }
  const _arguments = message.arguments || [];
  if(message.directive === "setValue") {
    element.itWasChangerdOnServer = true;
  }
  const result = element[message.directive](_arguments[0], _arguments[1], _arguments[2], _arguments[3], _arguments[4]);
  callback({ result: result });
})

server.on("dataUpdate", function (message, callback) {
  const elementId = message.elementId;
  const element = $$(elementId);
  if(!element) {
    callback({ err: "No such element with ID <" + elementId + ">" });
  }
  const _arguments = message.arguments || [];
  let result;
  if(message.directive === "create") {
    result = element.add(_arguments[0]);
    // sort
  } else if(message.directive === "update") {
    const item = _arguments[0];
    result = element.updateItem(item.id, item);
    const dataItem = element.getItem(item.id);
    if(dataItem.$parent != item.Parent.id) {
      element.move(item.id, undefined, undefined, { parent: item.Parent.id });
    }
    // sort
  } else if(message.directive === "delete") {
    const item = _arguments[0];
    result = element.remove(item.id);
  }

  callback({ result: result });
})

function callServer(action, message, callback) {
  if(window.clientId) {
    message.clientId = window.clientId;
  }
  message.applicationId = window.applicationId;
  message.windowId      = window.windowId;
  if(!message.lang) {
    message.lang = window.lang;
  }
  server.emit(action, message, function(err, result) {
    if(callback) {
      callback(err, result);
    } 
  });   
}

window.addEventListener("beforeunload", function(event) {
  server.emit("beforeunload", {
    applicationId: window.applicationId,
    windowId: window.windowId
  });
  event.returnValue = '';
});