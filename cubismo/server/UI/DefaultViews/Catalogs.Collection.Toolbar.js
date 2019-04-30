
function add(_arguments) {
  const row = _arguments.item[_arguments.uiElement.config.name].add();
  _arguments.uiElement.add(row);
}

function defineCommand(command, _arguments) {
  switch (command) {
    case "DefaultCmd.Add":
      _arguments.uiElement[command] = function () {
        add(_arguments);
      };
      break;
  }
}
module.exports.defineCommand = defineCommand;