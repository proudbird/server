/* globals __ROOT Tools Platform Application Form */
'use strict';

const _ = require('lodash');

var Controller = module.exports = {};

Controller.IncomingCall = function(Message) {
  var Form = Platform.Forms[Message.FormID];
  if(Message.Command === 'MasterChenged') {
    if(typeof(Message.index) === 'number') {
      const view = Form[Message.ViewName];
      //var targetName = view.View.dataBind.replace("Instance.", "");
      var target = Tools.getPropertyByTrack(Form, view.View.dataBind);
      //var target = Form.Instance[targetName];
      if(target) {
        var item = target[Message.index];
        if(!item) {
          item = {};
          target.push(item);
        }
        var attributes = Tools.getPropertyByTrack(Form.Instance._options.includeMap, view.View.dataBind, 2).attributes;
        for(var index in attributes) { 
          var attributeName = attributes[index];
          item[attributeName] = Message.item[attributeName];
        }
      }
    } else {
      try {
        var value = Message.Value;
        if(Form[Message.Property].View.view == "Checkbox") {
          if(Message.Value === 1) {
            value = true;
          } else {
            value = false;
          }
        }
        Form.Instance.set(Message.Property, { itWasChangerdOnClient: true, value: value });
      } catch(error) {}
    }
    return;
  }

  if(Message.Command === 'Lookup') {
    var target = Message.target;
    var dataLink = Message.value;
    var model = Platform.Applications[Message.appID][dataLink.cube][dataLink.class][dataLink.type];
    var connection = {};
    var instance = {};
    if(dataLink.collection) {
      model = model[dataLink.collection];
      var form = Platform.Forms[Message.FormID];
      var list = Tools.getPropertyByTrack(form, form[target.name].View.dataBind);
      if(Array.isArray(list)) {
        connection = list[target.index][dataLink.connection];
        instance = list[target.index][target.columnId];
      };
    } else {
      var form = Platform.Forms[Message.FormID];
      instance = form.Instance[target.name];
    }

    model.lookUp(undefined, false, { purpose: "lookup", instance: instance , owner: connection }, undefined, function(value) {
      var form = Platform.Forms[Message.FormID];
      var toModify = Tools.getPropertyByTrack(form, form[target.name].View.dataBind);
      if(form[target.name].View.view == "lookup") {
        //if(!toModify) {
          form.Instance[target.name] = value;
          form.Instance[target.name + "Id"] = value.id;
        //};
        form[target.name].updateItem(target, value);
        var dataView = form[target.name].View;
        if(dataView.afterLookUpCommand) {
          form[dataView.afterLookUpCommand]();
        }
      } else {
        if(!Array.isArray(toModify)) {
          Tools.setPropertyByTrack(form, form[target.name].View.dataBind, []);
        };
        if(toModify[target.index]) {
          toModify[target.index][target.columnId] = value;
          toModify[target.index][target.columnId + "Id"] = value.id;
        } else {
          var newValue = {};
          newValue[target.columnId] = value;
          newValue[target.columnId + "Id"] = value.id;
          toModify.push(newValue);
        }
        form[target.name].updateItem(target, value);
        var dataView = form[target.name].View;
        if(dataView.afterLookUpCommand) {
          form[dataView.afterLookUpCommand]();
        }
      }
    });
  }

  if(Message.Command === 'afterLookup') {
    var value = Message.Value;
    var dataSchema  = Form[Message.view.name].View.dataSchema;
    const mainObject = dataSchema.mainObject;
    var modelName  = Platform.Applications[Message.appID].ApplicationTypes[mainObject.type].Prefix + mainObject.cube + '_' + mainObject.model;
    if(mainObject.collection) {
      modelName = modelName + '_col' + mainObject.collection; 
    }
    const model      = Platform.Applications[Message.appID].DBConnection.models[modelName];  

    model
      .Select({ where: {id: value.id}})
        .then(result => {
          var form = Platform.Forms[Message.FormID];
          form.Close(result[0]);
      });
  }
  
  let params = {};

  if(Form) {
    if(Message.dynamic) {
      const UIElement = Form[Message.ViewName];
      if(UIElement) {
        const ApplicationTypes = require("./ModelTypes.js");
        const dataSchema = UIElement.View.dataSchema;
        const mainObject = dataSchema.mainObject;
        const modelName  = ApplicationTypes[mainObject.type].Prefix + mainObject.cube + '_' + mainObject.model;
        const model      = Platform.Applications[Message.AppID].DBConnection.models[modelName];
        let queryOptions = _.cloneDeep(dataSchema.queryOptions);
        if(!queryOptions) {
          queryOptions = {};
          queryOptions.where = {};
        }
        if(!queryOptions.where) {
          queryOptions.where = {};
        }
        
        if(Array.isArray(Message.ItemID)) {
          queryOptions.where.id = {[QO.in]: Message.ItemID };
        } else {
          queryOptions.where.id = Message.ItemID;
        }
        
        model
          .Select(queryOptions)
          .then(result => {
            let params = result;//[0];
            var EventHandler = Form[Message.Command];
            if(EventHandler) {
              EventHandler(params);
            }
          })
          .catch(error => {
            return log("Error on getting selected items", error)
          });
      }
    } else if(Message.command && Message.command === "setLikeFilter") {
      setLikeFilter(Form, Message);
    } else {
      params = Message.Value;
      var EventHandler = Form[Message.Command];
      if(EventHandler) {
        EventHandler(params);
      }
    }
  }
}

function setLikeFilter(form, params) {
  const view = form[params.viewName];
  if(view) {
    const dataSchema = view.View.dataSchema;

    if(dataSchema.filters[params.prevAttributeName] && params.attributeName != params.prevAttributeName ) {
      delete dataSchema.filters[params.prevAttributeName];
    }
  
    if(params.value != "") {
      view.setFilter({[params.attributeName]: iLIKE(params.attributeName, '%' + params.value + '%')});
    } else {
      view.setFilter({[params.attributeName]: undefined});
    } 
  }
}