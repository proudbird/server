var express = require('express');
var router  = module.exports = express();
var http    = require("http");
var server  = http.createServer(router);
var fs      = require('fs');

Cube.OnStart = function() {

  // server.testName = "webSite";
  // server.listen(process.env.PORT || 80, process.env.IP || "0.0.0.0", function(){
  //   var addr = server.address();
  //   console.log("web server listening at", addr.address + ":" + addr.port);
  // });

  // router.get('/', function(req, res, next) {
  //   var appId = req.query.appID;
  //   var isWindow = req.query.isWindow;
  //   if(!isWindow) {
  //     var view = fs.readFileSync(__dirname + '/index.html', 'UTF-8');
  //     res.send(view.replace(/AppName/g, Application.ID));
  //   } else {
  //     var view = Cube.Form("Window").Show();
  //     var viewConfig = _.ObjectToJSON(view);
  //     res.send(viewConfig);
  //   }
  // });

  // router.get('/:paramName', function(req, res, next) {
  //   if(req.params.paramName == "favicon.ico") {
  //     res.sendFile(__dirname + '/src/img/favicon.ico');
  //   }
  // });

  // router.get('/src/:folder(css|fonts|img|js|)/:fileName', function(req, res, next) {
  //   res.sendFile(__dirname + '/src/' + req.params.folder + '/' + req.params.fileName);  
  // });

  // router.get('/files/:folder(img)/:fileName', function(req, res, next) {
  //   res.sendFile(__dirname + '/files/' + req.params.folder + '/' + req.params.fileName);  
  // });

  // sockets.listen(server);

}