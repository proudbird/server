/* global Tools */
"use strict";
const fs = require("fs");
const path = require("path");

const Require = require("../Require.js");
const Traverse = require('traverse');

function ConfigView(View, _arguments, pathToFile) {

  let config = Require(pathToFile, {
    Application: _arguments.application
  });
  if (config.Init) {
    config = config.Init(_arguments.item ? _arguments.item : _arguments.type, _arguments.options);
  }

  Traverse(config).map(function (node) {
    if(Tools.isObjectLike(node)) {
      console.log(node)
    }
    if (node && typeof node != 'function') {
      const uiElement = node;
      if (node.view && node.name && node.name !== 'data') {
        if (!node.id) {
          if (node.main) {
            node.id = this.node_.id = View.id;
          } else {
            node.id = this.node_.id = Tools.SID();
            node.viewId = this.node_.viewId = View.id;
          }
          this.update(node);
        }

        if (node.owner && node.composition === "default") {
          let pathToDefaultCommandsFile = path.join(__dirname, "./DefaultViews/Catalogs.List.Toolbar.Config.js");
          if (_arguments.item) {
            pathToDefaultCommandsFile = pathToDefaultCommandsFile.replace("List", "Item");
          }
          const toolbar = require(pathToDefaultCommandsFile).Init(node.owner);
          node.elements = this.node_.elements = toolbar;
          let owner = View[node.owner];
          if (!owner) {
            Object.defineProperty(View, node.owner, {
              value: {},
              enumerable: true,
              writable: false
            });
          }
          Object.defineProperty(View[node.owner], node.name, {
            value: {
              config: uiElement
            },
            enumerable: true,
            writable: false
          });
        } else if (node.owner) {
          const ownerPath = node.owner.split(".");
          let target = View[node.owner];
          if (ownerPath.length = 2) {
            target = View[ownerPath[0]][ownerPath[1]];
          }
          //Object.defineProperty(target, node.name, { 
          //value: { config: uiElement }, enumerable: true, writable: false 
          //});
          let pathToDefaultCommandsFile = path.join(__dirname, "./DefaultViews/Catalogs.List.Toolbar.js");
          let commands = require(pathToDefaultCommandsFile);
          _arguments.view = View;
          _arguments.uiElement = target;
          if (_arguments.item) {
            pathToDefaultCommandsFile = pathToDefaultCommandsFile.replace("List", "Item");
            commands = require(pathToDefaultCommandsFile);
          }
          commands.defineCommand(node.name, _arguments);
        } else {
          let element = View[node.name];
          if (element) {
            Object.defineProperty(element, "config", {
              value: uiElement,
              enumerable: true,
              writable: true
            });
          } else {
            Object.defineProperty(View, node.name, {
              value: {
                config: uiElement
              },
              enumerable: true,
              writable: false
            });
            element = View[node.name];
          }
          if (node.dataLink) {
            // UI element has value rpoperty and must be populated with data
            _populateDataView(View, node, this,_arguments);
          }
          if (node.select) {
            let pathToDefaultCommandsFile = path.join(__dirname, "./DefaultViews/Catalogs.List.Toolbar.js");
            let commands = require(pathToDefaultCommandsFile);
            _arguments.view = View;
            _arguments.uiElement = View[node.name];
            if (_arguments.item) {
              pathToDefaultCommandsFile = pathToDefaultCommandsFile.replace("List", "Item");
              commands = require(pathToDefaultCommandsFile);
            }
            commands.defineCommand("DefaultCmd.Enter", _arguments);
          }
        }

        // const dataValue = Tools.getPropertyByTrack(View, node.dataBind);
        // if (dataValue) {
        //   Object.defineProperty(View[node.name], "data", {
        //     value: dataValue,
        //     enumerable: true
        //   });
        // }

        // const item = View.item;
        // if (dataValue && item) {
        //   const data = {
        //     id: item.id,
        //     name: item.Name
        //   };
        //   View.item = data;
        // }

        const pathToUIFile = path.join(__dirname, uiElement.view + ".js");
        if (fs.existsSync(pathToUIFile)) {
          Require(pathToUIFile, {
            Application: _arguments.application,
            View: View,
            UIElement: View[node.name]
          });
        }
      }
    }
  });

  View.config = config;
}

function _populateDataView(View, element, node, _arguments) {

  let item = undefined;
  let modelName = undefined;
  let definition = undefined;
  let attribute = undefined;
  let dataValue = undefined;
  const linkPath = element.dataLink.split(".");
  const source = linkPath[0];
  const valueProperty = linkPath[1];

  function __getValue(item, property) {
    let value = item.getValue(property);
    if (typeof value === "object" && value) {
      return value.getValue("Name");
    }
    return value;
  }
  
  // UI element can be single value (text, lookup, etc.) and multy-value (all lists)
  if(Tools.has(element, "select")) { // only multi-value elements have 'select' option 

  } else { // single value element
    item = View[source];
    definition = item._.model.definition;
    attribute = definition.attributes[valueProperty] || { type: { dataType: undefined}};
    // chack if source is a reference type
    if(valueProperty === "Owner" || valueProperty === "Parent" || attribute.type.dataType === "FK") {
      modelName = item._.model.associations[valueProperty].target.name;
    } else if(source === "item" || source === "owner" || source === "parent") {
      modelName = item._.model.name;
    }

    if(valueProperty) {
      dataValue = item.getValue(valueProperty);
    } else {
      dataValue = item;
    }

    // if model name is determed, so it is a reference type and we need 'instance' property
    if(modelName) {
      element.instance = node.node_.instance = {
        type: modelName
      };
      if (Tools.isObjectLike(dataValue)) {
        element.instance.id = dataValue.getValue("id");
        element.instance.title = dataValue.getValue("Name");
        node.node_.value = element.instance.title;
      } else {
        node.node_.value = dataValue;
      }
    } else{
      node.node_.value = __getValue(item, valueProperty);
    }
  }
}
module.exports = ConfigView;