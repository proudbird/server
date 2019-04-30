/* globals Tools */
'use strict';
const _ = require('lodash');

function handleClientEvent(message, view) {
  
  switch (message.command) {
    default: 
      const eventHandler = view[message.command];
      if(eventHandler) {
        eventHandler(message.params);
      } else {
        Log.error("Can't find method <" + message.command + ">.");
      }
  }
}
module.exports.handleClientEvent = handleClientEvent;