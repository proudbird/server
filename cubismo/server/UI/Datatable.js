/* globals Tools SEQUELIZE QO Platform Form UIElement */

const _ = require('lodash');

UIElement.Refresh = function(callback) {
    var Message = {};
    Message.Directive = 'Refresh';
    Message.ViewID    = UIElement.View.id;
    Form.Client.emit('message', Message, function(Response) {
      if(callback) callback(Response);
    });
}

UIElement.Add = function(value, callback) {
  if(!value) {
    value = {id: Tools.GUID()}
  }
  var Message = {};
  Message.Directive = 'Add';
  Message.ViewID    = UIElement.View.id;
  Message.Value     = value;
  Form.Client.emit('message', Message, function(Response) {
    if(callback) callback(Response);
  });
}

UIElement.updateItem = function(target, value, callback) {
  var message = {};
  message.directive = 'updateItem';
  message.target    = { id: UIElement.View.id, rowId: target.rowId, columnId: target.columnId };
  message.value     = value;
  Form.Client.emit('message', message, function(response) {
    if(callback) callback(response);
  });
}

UIElement.Remove = function(items, callback) {
  var forDeletion = [];
  if(Array.isArray(items)) {
    for(let i=0; i<items.length; i++) {
      forDeletion.push(items[i].id);
    };
  } else {
    forDeletion = items.id;
  }
  var Message = {};
  Message.directive = 'remove';
  Message.viewID    = UIElement.View.id;
  Message.data     = forDeletion;
  Form.Client.emit('message', Message, function(error) {
    if(!error) {
      for(let i=0; i<forDeletion.length; i++) {
        var id = forDeletion[i];
        for(let x=0; x<UIElement.data.length; x++) {
          var curId = UIElement.data[x].id;
          if(curId === id) {
            UIElement.data.splice(x, 1);
          } 
        };
      };
    } else {
      console.log(error);
    }
    if(callback) callback();
  });
}

UIElement.GetSelectedItems = function(callback) {
    var Message = {};
    Message.Directive = 'GetSelectedItems';
    Message.ViewID    = UIElement.View.id;
    Form.Client.emit('message', Message, function(Response) {
      var dataSchema  = UIElement.View.dataSchema;
      if(!dataSchema) {
        callback(Response.Value);
        return;
      } else {
        var Data        = Response.Value;
        var Application = Platform.Applications[Response.AppID];
        
        var Selectors = [];
        for(var i = 0; i < Data.length; i++) {
          Selectors.push(Data[i].id);
        }
        
        const mainObject = dataSchema.mainObject;
        const modelName  = Application.ApplicationTypes[mainObject.type].Prefix + mainObject.cube + '_' + mainObject.model;
        const model      = Application.DBConnection.models[modelName];
        
        let queryOptions = _.cloneDeep(UIElement.View.dataSchema.queryOptions);
        if(!queryOptions) {
          queryOptions = {};
          queryOptions.where = {};
        }
        if(!queryOptions.where) {
          queryOptions.where = {};
        }
        
        queryOptions.where.id = {[QO.in]: Selectors };
        
        model
          .Select(queryOptions)
            .then(Result => {
              callback(Result);
          });
      }
    });
}

UIElement.SetFilter = function(filters, callback) {
    let queryOptions = UIElement.View.dataSchema.queryOptions;
    if(!queryOptions) {
      queryOptions = {};
      queryOptions.where = {};
    }
    if(!queryOptions.where) {
      queryOptions.where = {};
    }
    
    filters.forEach(function(item, i, filters) {
      queryOptions.where[item.attribute] = item.value;
    });
    
    UIElement.Refresh();
}

UIElement.Search = function(filters, callback) {
    let queryOptions = UIElement.View.dataSchema.queryOptions;
    if(!queryOptions) {
      queryOptions = {};
      queryOptions.where = {};
    }
    if(!queryOptions.where) {
      queryOptions.where = {};
    }
    
    filters.forEach(function(item, i, filters) {
      queryOptions.where[item.attribute] = item.value;
    });
    
    UIElement.Refresh();
}

UIElement.getSelected = function(callback) {

  return new Promise(function (resolve, reject) {
    const message = {
      directive: "getSelectedItem",
      elementId: UIElement.config.id,
      arguments: [true]
    }

    Application.window.directiveToClient("directive", message, async function (response) {
      if (response.err) {
        reject(error);
      } else {
        const indexies = response.result.map(function callback(value) {
          return value.rowNumber - 1;
        });
        const data = UIElement.data.map(function callback(value, index) {
          if(indexies.includes(index)) {
            return value;
          }
        });
        resolve(data);
      }
    })
  });
}

UIElement.add = function(item, callback) {
  
  return new Promise(function (resolve, reject) {
    const itemData = item.toJSON();
    const message = {
      directive: "add",
      elementId: UIElement.config.id,
      arguments: [itemData]
    }

    Application.window.directiveToClient("directive", message, async function (response) {
      if (response.err) {
        reject(error);
      } else {
        resolve(response.result);
      }
    })
  });
}