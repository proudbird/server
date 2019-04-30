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

UIElement.Remove = function(item, callback) {
  var Message = {};
  Message.Directive = 'Remove';
  Message.ViewID    = UIElement.View.id;
  Message.Item      = item.id ? item.id: item;
  Form.Client.emit('message', Message, function(Response) {
    if(callback) callback(Response);
  });
}

UIElement.GetSelectedItems = function(callback) {
    var Message = {};
    Message.Directive = 'GetSelectedItems';
    Message.ViewID    = UIElement.View.id;
    Form.Client.emit('message', Message, function(Response) {
      var dataSchema  = UIElement.View.dataSchema;
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
    });
}

UIElement.setFilter = function(filter, callback) {
  let filters = UIElement.View.dataSchema.filters;
  if(!filters) {
    UIElement.View.dataSchema.filters = filters = {};
  }
  for(let key in filter) {
    if(filter[key] === undefined) {
      delete filters[key];
    } else {
      filters[key] = filter[key];
    }
  }

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