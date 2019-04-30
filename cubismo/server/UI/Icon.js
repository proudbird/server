
/* globals Form UIElement */

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