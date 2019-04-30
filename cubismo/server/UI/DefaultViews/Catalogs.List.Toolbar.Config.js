function Init(owner, viewId, customComposition) {

  if(customComposition && !Array.isArray(customComposition)) {
    throw new Error("Only 'Array' type is acceptable!");
  }
  
  const toolbarElements = [];

  const defaultCommands = {
    create: { name: "Create", title: "Create", command: "create" },
    folder: { name: "Folder", title: "Folder", command: "folder" },
    edit:   { name: "Edit"  , title: "Edit"  , command: "edit"   },
    copy:   { name: "Copy"  , title: "Copy"  , command: "copy"   },
    delete: { name: "Delete", title: "Delete", command: "delete" },
    remove: { name: "Remove", title: "Remove", command: "remove" }
  };

  const defaultComposition = [];
  for(let key in defaultCommands) {
    defaultComposition.push(key);
  }

  let composition = customComposition || defaultComposition;

  composition.forEach(directive => {
    const element = defaultCommands[directive];
    toolbarElements.push(
      { 
        view: "Button",
        id: Tools.SID(), 
        viewId: viewId,
        name: "DefaultCmd." + element.name, 
        value: element.title, 
        owner: owner + ".Toolbar",
        events: { onItemClick: element.command } 
      }
    );
  });

  return toolbarElements;
}
module.exports.Init = Init;