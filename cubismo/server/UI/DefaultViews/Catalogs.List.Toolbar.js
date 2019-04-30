async function create(_arguments) {
  const newItem = await _arguments.type.new();
  newItem.show();
}

async function folder(_arguments) {
  _arguments.type.newFolder().show();
}

async function edit(_arguments) {
  const selected = await _arguments.uiElement.getSelected();
  const item = selected[0];
  item.show();
}

async function copy(_arguments) {
  const selected = await _arguments.view.List.getSelected();
  const item = selected[0];
  const newItem = _arguments.type.new(item);
  newItem.show();
}

async function remove(_arguments, immediate) {
  const selected = await _arguments.view.List.getSelected();
  selected.forEach(async (item) => {
    await item.delete(immediate);
  });
}

async function enter(_arguments) {
  const selected = await _arguments.view.List.getSelected();
  if(_arguments.view.options.purpose === "select") {
    _arguments.view.close(selected[0]);
  }
}

async function onAfterLoad(_arguments) {
  try {
    _arguments.view.List.openAll();
  } catch(err) {
    // TODO maybe
  }
}

function defineCommand(command, _arguments) {
  switch (command) {
    case "DefaultCmd.Create":
      _arguments.uiElement[command] = function () {
        create(_arguments);
      };
      break;
    case "DefaultCmd.Folder":
      _arguments.uiElement[command] = function () {
        folder(_arguments);
      };
      break;
    case "DefaultCmd.Edit":
      _arguments.uiElement[command] = function () {
        edit(_arguments);
      };
      break;
    case "DefaultCmd.Copy":
      _arguments.uiElement[command] = function () {
        copy(_arguments);
      };
      break;
    case "DefaultCmd.Delete":
      _arguments.uiElement[command] = function () {
        remove(_arguments);
      };
      break;
    case "DefaultCmd.Remove":
      _arguments.uiElement[command] = function () {
        remove(_arguments, true);
      };
      break;
    case "DefaultCmd.Enter":
      _arguments.uiElement[command] = function () {
        enter(_arguments);
      };
      break;
    case "DefaultCmd.OnAfterLoad":
      _arguments.uiElement[command] = function () {
        onAfterLoad(_arguments);
      };
      break;
  }
}
module.exports.defineCommand = defineCommand;