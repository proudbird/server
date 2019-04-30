/* globals Tools Log */
"use strict";
const _ = require('lodash');

function Query(application, driver) {

  this._ = {};
  this._.driver = driver;
  this._.application = application;

  this.execute = function (options, model, subscriber) {
    const self = this;

    if (!options) {
      options = {};
    }

    let raw = false;
    if (!model) {
      raw = true;
    }

    if (!model && typeof options.FROM === "string") {
      model = this._.driver.models[options.FROM];
    }

    let queryModel = model;
    if (raw) {
      queryModel = undefined;
    }

    async function mainFunction(callback) {
      try {
        const sql = buildSQLQuery(self._.driver, options, subscriber);
        const result = await self._.driver.query(sql, queryModel);
        return callback(null, result);
      } catch(err) {
        throw new Error(err.message);
      };
    }

    return new Promise(function (resolve, reject) {
      mainFunction(function (error, result) {
        error ? reject(error) : resolve(result);
      });
    });
  }
}

function buildSQLQuery(driver, query, subscriber) {

  let from = query.FROM || query.from;
  const model = driver.models[from];
  if (!model) {
    throw new Error("Can't find DB model <" + from + ">");
  } else if (subscriber) {
    if(!Tools.has(model, "subscribers")) {
      model.subscribers = {};
    }
    model.subscribers[subscriber.config.id] = subscriber;
  }

  //SELECT
  var result = 'SELECT ';
  const select = query.SELECT || query.select;
  let fields = [];
  if (Array.isArray(select)) {
    for (let i = 0; i < select.length; i++) {
      const field = select[i];
      if (typeof field === 'object') {
        fields.push(buildOperation(model, field));
      } else {
        fields.push('"' + field + '"');
      }
    }
  } else {
    fields.push('*');
  }

  //FROM
  result = result + fields.join(', ');
  result += ' FROM "' + model.tableName + '" T1';

  //WHERE
  const where = query.WHERE || query.where;
  if (Array.isArray(where) && where.length > 0) {
    let newWhere = [];
    for (let i = 0; i < where.length; i++) {
      newWhere.push(buildOperation(model, where[i]));
    }
    result = result + ' WHERE ' + newWhere.join(' AND ');
  } else if (typeof where === "object" && !Array.isArray(where)) {
    result = result + ' WHERE ' + buildOperation(model, where);
  } else if(where && !Array.isArray(where)) {
    throw new Error("Wrong format of 'WHERE' statement.")
  }

  //ORDER
  const order = query.ORDER || query.order;
  const inside = order[0];
  if (Array.isArray(inside) && inside.length) {
    let newOrder = [];
    for (let i = 0; i < order.length; i++) {
      newOrder.push("\"" + order[i][0] + "\" " + order[i][1]);
    }
    result = result + ' ORDER BY ' + newOrder.join(', ');
  } else if (Array.isArray(order)) {
    result = result + ' ORDER BY ' + "\"" + order[0] + "\" " + order[1];
  } else {
    throw new Error("Wrong format of 'ORDER' statement.")
  }

  //LIMIT
  const limit = query.LIMIT || query.limit;
  if (limit) {
    result = result + ' LIMIT ' + limit;
  }

  //OFFSET
  const offset = query.OFFSET || query.offset;
  if (offset) {
    result = result + ' OFFSET ' + offset;
  }

  return result;
}

function buildOperation(model, operation) {

  var buildOperations = function (operations, newOperations) {
    for (let i = 0; i < operations.length; i++) {
      let operation = operations[i];
      if (operation && Array.isArray(operation)) {
        buildOperations(operation);
      }
      newOperations.push(buildOperation(model, operation));
    }
  }

  let operator;
  for (operator in operation) {
    let param = operation[operator][0];
    let value = operation[operator][1];

    const association = model.associations[param];
    if (association) {
      param = association.identifierField;
      value = value[association.targetIdentifier];
    }

    if (Array.isArray(param)) {
      let newOperations = [];
      buildOperations(param, newOperations);
      param = newOperations;
    }

    switch (operator) {
      case "EQ":
        if (value === null || value === undefined) {
          return "\"" + param + "\" IS NULL";
        } else if (value === true) {
          return "\"" + param + "\" IS TRUE";
        } else if (value === false) {
          return "\"" + param + "\" IS FALSE";
        } else {
          return "\"" + param + "\" = '" + value + "'";
        }
      case "LIKE":
        return "\"" + param + "\" LIKE '" + value + "'";
      case "iLIKE":
        return "\"" + param + "\" iLIKE '" + value + "'";
      case "AND":
        return "(" + params.join(" AND ") + ")";
      case "OR":
        return "(" + params.join(" OR ") + ")";
      case "AS":
        return "\"" + param + "\" AS \"" + value + "\"";
      case "EXISTSAS":
        return "EXISTS (" + param + ") AS \"" + value + "\"";
      case "STARTSWITH":
        return "\"" + param + "\" LIKE '" + value + "%'";
    }
  }
}
module.exports = Query;