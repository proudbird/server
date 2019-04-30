function save(_arguments) {
  _arguments.item.save();
  _arguments.view.close();
}

function close(_arguments) {
  _arguments.view.close();
}

function add(_arguments) {
  _arguments.item[uiElement.name].add();
}

function defineCommand(command, _arguments) {
  switch (command) {
    case "DefaultCmd.Save":
    _arguments.uiElement[command] = function() {
        save(_arguments);
      };
      break;
    case "DefaultCmd.Close":
    _arguments.uiElement[command] = function() {
        close(_arguments);
      };
      break;
    case "DefaultCmd.Add":
      _arguments.uiElement[command] = function () {
        add(_arguments);
      };
      break;
  }
}
module.exports.defineCommand = defineCommand;