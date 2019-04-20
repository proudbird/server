var express = require('express');
var router  = module.exports = express();
var http    = require("http");
var server  = http.createServer(router);
var fs      = require('fs');
const path  = require("path");

Cube.onStart = function() {

  const clientId = _.GUID();
  Application.subscribeOnClient(clientId, client => {
    Cube.client = client;
    client.emit("start");
    client.on("mainView", (message, callback) => {
      Cube.Common.Views("Window")
        .show()
        .then(viewConfig => {
          //Cube.mainView = Application.views[view.config.id];
          //Cube.Common.Modules.Fullpage.init(Cube.mainView.Fullpage);
          console.log("Loading main view...");
          callback(viewConfig);
      })
    });
  });

  const files = path.join(Cube.dirname, 'files');
  const src = path.join(files, "src");
  const system = path.join(Application.dirname, "client");

  server.testName = "webSite";
  server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
    var addr = server.address();
    Log.info(`E-Shop server listening at ${addr.address}:${addr.port}`);
  });

  router.get('/', function(req, res, next) {
    const view = fs.readFileSync(path.join(files, 'index.html'), 'UTF-8');
    res.send(view.replace("{clientId}", clientId));
  });

  router.get('/:paramName', function(req, res, next) {
    if(req.params.paramName == "favicon.ico") {
      res.sendFile(path.join(src, "img/favicon.ico"));
    }
  });

  router.get('/src/:folder(css|fonts|img|js|)/:fileName', function(req, res, next) {
    res.sendFile(path.join(src, req.params.folder, req.params.fileName));  
  });

  router.get('/system/:folder(css|fonts|img|js|)/:fileName', function(req, res, next) {
    res.sendFile(path.join(system, req.params.folder, req.params.fileName));  
  });

  router.get('/files/:folder(img)/:fileName/', function(req, res, next) {
    res.sendFile(path.join(files, req.params.folder, req.params.fileName));  
  });

  router.get('/files/*', function(req, res, next) {
    res.sendFile(path.join(files, req.params[0]));  
  });
}