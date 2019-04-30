
/* globals Form UIElement */
const addView = require("./AddView.js");

UIElement.hide = async function () {

  return new Promise(function (resolve, reject) {
    const message = {
      directive: "hide",
      elementId: UIElement.config.id,
      arguments: []
    }

    Application.window._.client.emit("directive", message, async function (response) {
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

    Application.window._.client.emit("directive", message, async function (response) {
      if (response.err) {
        reject(error);
      } else {
        resolve(null);
      }
    })
  });
}

UIElement.addView = async function (config) {

  config = addView(Application.views[UIElement.config.viewId], config, {
    application: Application
  });

  return new Promise(function (resolve, reject) {
    const message = {
      directive: "addView",
      elementId: UIElement.config.id,
      arguments: [config]
    }

    Application.window._.client.emit("directive", message, async function (response) {
      if (response.err) {
        reject(error);
      } else {
        resolve(null);
      }
    })
  });
}