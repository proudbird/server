/* global Tools */
"use strict";
const fs     = require("fs");
const path   = require("path");

const Require    = require("../Require.js");
const ConfigView = require("./ConfigView.js");

const View = require("./View.js");

function MainWindow(_arguments) {
    
    const _ = {};
    _.client = _arguments.client;
    
    View.call(this, _arguments);

    this.__proto__.directiveToClient = function(action, message, callback) {

        const mainFunction = function(callback) {
            _.client.emit(action, message, function(err) {
                if(err) {
                    callback(err);
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
}
module.exports = MainWindow;