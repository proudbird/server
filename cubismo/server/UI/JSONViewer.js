/* globals Form UIElement */

UIElement.render = function(json, level) {
  const message = {
    directive: 'render',
    viewID   : UIElement.View.id,
    value    : json,
    level    : level
  };
  Form.Client.emit('message', message);
}