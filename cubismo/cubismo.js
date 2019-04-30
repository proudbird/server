/* globals __ROOT Tools Platform Log*/
const  path = require('path');

process.env.NODE_ENV= "development";
process.env.BLUEBIRD_WARNINGS = 0;

process.on('uncaughtException', function (err) {
  const _stack = err.stack.split('\n');
  let newStack = [];
  for(let i = 0; i < _stack.length; i++) {
    //if(_stack[i].includes(path.join(__dirname, "server"))) {
      newStack.push(_stack[i]);
    //}
  }
  newStack = newStack.join('\n');
  console.log('\n');
  console.log('Caught exception: ' + err);
  console.log(newStack);
  console.log('\n');
});

process.on('unhandledRejection', function (err) {
  //const _stack = err.stack.split('\n');
  //let newStack = [];
  //for(let i = 0; i < _stack.length; i++) {
    //if(_stack[i].includes(path.join(__dirname, "server"))) {
      //newStack.push(_stack[i]);
    //}
  //}
  //newStack = newStack.join('\n');
  console.log('\n');
  console.log('Caught promise exception:');
  if(err.message) {
    console.log(err.message);
  }
  if(err.stack) {
    console.log(err.stack);
  }
  //console.log(newStack);
  console.log('\n');
});

require("./server/Logger.js");
require("./server/Globals.js")();

function run(root, port) {

  const platform = require("./server/Platform.js");
  platform.dir = root;

  const router   = require("./server/Router.js").init(platform);

  const http     = require("http");
  const server   = http.createServer(router);

  server.listen(process.env.PORT || port, process.env.IP || "0.0.0.0", function(){
    var addr = server.address();
    console.log("cubismo server listening at " + addr.address + ":" + addr.port);
  });
  
  sockets.listen(server);
}

module.exports.run = run;