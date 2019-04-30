/* globals __ROOT Tools Platform SEQUELIZE*/ 'use strict'; module.exports = Application;

var fs = require('fs');
const _ = require('lodash');
const DB = require('./DB.js');
const query = require('./Query.js');

function Application(AppName, AppID) {
  this.Name   = AppName;
  this.ID     = AppID;
  this.Config = JSON.parse(fs.readFileSync(__ROOT + '/config.json', 'UTF-8'))['applications'][AppName];
  this.Dir    = this.Config['directory'];
  
  this.DBConnection = DB.Init();
  this.DBConnection.Application = this;
                          
  this.DB = this.DBConnection;

  this.Window = function() {
    return Platform.Forms[process.env.WINDOW];
  }

  this.GetUsers = function(callback) {
    
    var self = this;
    
    function mainFunction(callback) {
      const model = self.DBConnection.models.sysUsers;
      model
        .findAll()
        .then(result => {
          return callback(null, result);
        })
        .catch((error) => {
          return callback(error);
        });
    }
      
    if (callback) {
      return mainFunction(callback);
    }
    
    return new Promise(function(resolve, reject) {
      mainFunction(function (error, result) {
        error ? reject(error) : resolve(result);
      });
    });
  }
  
  this.CurrentUser = function(callback) {
    
    var self = this;
    
    function mainFunction(callback) {
      const model = self.DBConnection.models.sysUsers;
      model
        .findOne({where: {Login: process.env.USER}})
        .then(result => {
          return callback(null, result);
        })
        .catch((error) => {
          return callback(error);
        });
    }
      
    if (callback) {
      return mainFunction(callback);
    }
    
    return new Promise(function(resolve, reject) {
      mainFunction(function (error, result) {
        error ? reject(error) : resolve(result);
      });
    });
  }
}