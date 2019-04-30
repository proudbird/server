/* global Tools */
"use strict";
const fs = require("fs");
const path = require("path");

const Require = require("../Require.js");
const addView = require("./AddView.js");

function ConfigView(View, _arguments, pathToFile) {

  var config = Require(pathToFile, {
    Application: _arguments.application
  }, true);
  if (config.Init) {
    config = config.Init(_arguments.item ? _arguments.item : _arguments.type, _arguments.options);
  }

  Tools.traverse(config, function (node) {
    addView(View, node, _arguments);
  });

  View.config = config;
}
module.exports = ConfigView;