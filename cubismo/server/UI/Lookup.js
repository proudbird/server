/* globals Tools SEQUELIZE QO Platform Form UIElement */

const _ = require('lodash');

UIElement._updateItem = function(target, value, callback) {
  var message = {};
  message.directive = 'updateInstance';
  message.target    = { id: UIElement.View.id };
  message.value     = { id: value.id, name: value.Name };
  Form.Client.emit('message', message, function(response) {
    if(callback) callback(response);
  });
}


UIElement.updateItem = async function () {

  return new Promise(function (resolve, reject) {
    const message = {
      directive: "update",
      elementId: UIElement.config.id,
      arguments: [{ id: value.id, name: value.Name }]
    }

    Application.window.directiveToClient("directive", message, async function (response) {
      if (response.err) {
        reject(error);
      } else {
        resolve(null);
      }
    })
  });
}

UIElement.hide = async function () {

  return new Promise(function (resolve, reject) {
    const message = {
      directive: "hide",
      elementId: UIElement.config.id,
      arguments: []
    }

    Application.window.directiveToClient("directive", message, async function (response) {
      if (response.err) {
        reject(error);
      } else {
        resolve(null);
      }
    })
  });
}

UIElement.show = async function () {

  return new Promise(function (resolve, reject) {
    const message = {
      directive: "show",
      elementId: UIElement.config.id,
      arguments: []
    }

    Application.window.directiveToClient("directive", message, async function (response) {
      if (response.err) {
        reject(error);
      } else {
        resolve(null);
      }
    })
  });
}