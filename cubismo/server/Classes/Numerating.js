/* global Tools */
"use strict";
const numerator = require("numerator");

async function nextCode(application, model, prefix) {

  const definition = model.definition;

  const query = {
    SELECT: ["Code"],
    FROM:   model.name,
    ORDER:  ["Code", "DESC"],
    LIMIT: 1
  }

  if(prefix) {
    query.WHERE = [ { STARTSWITH: ["Code", prefix] } ];
  }

  let last = await application.Query.execute(query);
  last = Tools.get(last, "[0][0].Code") || 0;
  const next = numerator.next(last);

  model.numerator = model.numerator || {};
  model.numerator[numerator.getPrefix(next)] = next;

  return next;
}

module.exports.nextCode = nextCode;