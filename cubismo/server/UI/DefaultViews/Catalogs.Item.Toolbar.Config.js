function Init(owner, viewId, customComposition) {

  if(customComposition && !Array.isArray(customComposition)) {
    throw new Error("Only 'Array' type is acceptable!");
  }
  
  const toolbarElements = [];

  const defaultCommands = {
    save:  { name: "Save" , title: "Save" , command: "save" },
    close: { name: "Close", title: "Close", command: "close" }
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