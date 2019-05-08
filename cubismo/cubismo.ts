module.exports.run = function(root: string, port: number) {

  require("./server/Logger.js");
  require("./server/Errors.js");

  const platform = require("./server/Platform.js").init(root);
  const router   = require("./server/Router.js").init(platform);

  const http     = require("http");
  const server   = http.createServer(router);

  server.listen(process.env.PORT || port, process.env.IP || "0.0.0.0", function(){
    const {_address, _port} = server.address();
    //Log.info(`cubismo server listening at ${_address}:${_port}`);
  });
  
}