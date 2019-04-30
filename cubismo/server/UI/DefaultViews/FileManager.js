const fs         = require("fs");
const path       = require("path");
const catalogist = require("catalogist");

let currentDir;

View.onInit = function(next) {
  currentDir = path.join(Application.dirname, ".home");
  next();
}

View.getFileTree = async function() {
  return await catalogist.tree(currentDir, { onlyFolders: true, childrenAlias: "data" });
}

View.getFileList = async function() {
  return await catalogist.list(currentDir);
}

View.Tree_onBeforeEditStop = function(item, newValue, oldValue, result) {
  const newName = path.join(Application.dirname, ".home", item.path, newValue);
  const oldName = path.join(Application.dirname, ".home", item.path, item.fullName);
  if(fs.existsSync(newName)) {
    Application.alert(`Folder with name '${newValue}' already exists!`);
    if(typeof result === "function") {
      return result(false)
    }
  } else {
    fs.rename(oldName, newName, (err) => {
      if(err) {
        Application.alert(err.message);
        result(false);
      }
      item.fullName = newValue;
      item.fullPath = path.join(item.path, newValue);
      View.Tree.updateItem(item);
      result(true);
    });
  }
}