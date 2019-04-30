/* globals __ROOT Tools Platform SEQUELIZE*/ 'use strict';
var DB = {};
module.exports = DB;

const _ = require('lodash');

DB.Init = function() {

  var DBConnection = new SEQUELIZE(
      'cubismo',
      'cubismo',
      'cubismo', {
        dialect: 'postgres',
        logging: false,
        operatorsAliases: false,
        charset: 'utf8',
        collate: 'utf8_general_ci'
      }
    );
    
  DBConnection.Query = function(query, model, callback) {
    var self = this;
    
    function mainFunction(callback) {
      self
        .query(query, model ? { model: model }: undefined)
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

  DBConnection.GetModel = function(dataSchema) {
    const mainObject   = dataSchema.mainObject;
    var modelName    = this.Application.ApplicationTypes[mainObject.type].Prefix + mainObject.cube + '_' + mainObject.model;
    if(mainObject.collection) {
      modelName = modelName + '_col' + mainObject.collection;
    }
    return this.Application.DBConnection.models[modelName];
  }

  DBConnection.GetData = function(formID, viewName, parentId, callback) {
    let self = this;
    if(!formID || !viewName) {
      callback(null);
      return;
    }
    const form = Platform.Forms[formID];
    if(!form) {
      callback(null);
      return;
    }
    const view = form[viewName];
    if(!view) {
      callback(null);
      return;
    }
    const dataSchema   = form[viewName].View.dataSchema;
    const model        = self.GetModel(dataSchema);
    const queryOptions = dataSchema.queryOptions;
    const filters      = dataSchema.filters;

    let where = [];
    for(let key in filters) {
      let item = filters[key];
      if(item) {  
        where.push(_.clone(item));
      }
    };

    if(view.View.treeType) {
      
      if(!dataSchema.mainObject.collection) {
        where.push(EQ("ParentId", parentId ? parentId : null));
        dataSchema.attributes.push(AS("IsFolder", "webix_kids"));
      }
      
    }

    let query = new Query(
      {
        SELECT: dataSchema.attributes,
        FROM:   model,
        WHERE:  where,
        LIMIT:  queryOptions.limit,
        ORDER:  queryOptions.order
      }
    );
  
    query
      .EXECUTE()
      .then(result => {
        let data = result[0];
        if(view.View.treeType) {
          data = {
            parent: parentId ? parentId : 0,
            data: data
          }
        }
        if(callback) {
          callback(null, data);
        }
      })
      .catch(error => {
        console.log("Error on query executing! Model = " + query.FROM.tableName);
        console.log(error);
        if(callback) {
          callback(error);
        }
      });
  }

  DBConnection.GetSuggest = function(formID, viewName, filter, callback) {
    let self = this;
    if(!formID || !viewName) {
      callback(null);
      return;
    }
    const form = Platform.Forms[formID];
    if(!form) {
      callback(null);
      return;
    }
    const view = form[viewName];
    if(!view) {
      callback(null);
      return;
    }
    const dataSchema   = form[viewName].View.dataSchema;
    const model        = self.GetModel(dataSchema);
    const queryOptions = dataSchema.queryOptions;
    let filters      = dataSchema.filters;
  
    if(!filters) {
      dataSchema.filters = filters = {};
    }
    filters.folder = iLIKE("Name", "%" + filter["value"] + "%");
  
    let where = [];
    for(let key in filters) {
      let item = filters[key];
      if(item) {  
        where.push(_.clone(item));
      }
    };
  
    if(view.View.treeType) {
      where.push(EQ("ParentId", parentId ? parentId : null));
      dataSchema.attributes.push(AS("IsFolder", "webix_kids"));
    }
  
    let query = new Query(
      {
        SELECT: dataSchema.attributes,
        FROM:   model,
        WHERE:  where,
        LIMIT:  queryOptions.limit,
        ORDER:  queryOptions.order
      }
    );
  
    query
      .EXECUTE()
      .then(result => {
        let data = result[0];
        if(view.View.treeType) {
          data = {
            parent: parentId ? parentId : 0,
            data: data
          }
        }
        if(callback) {
          callback(null, data);
        }
      })
      .catch(error => {
        console.log("Error on query executing! Model = " + query.FROM.tableName);
        console.log(error);
        if(callback) {
          callback(error);
        }
      });
  }

  return DBConnection;
}

