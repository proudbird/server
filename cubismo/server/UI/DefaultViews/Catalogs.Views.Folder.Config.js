/* globals Tools Application ID ContainerID webix*/
module.exports.Init = function (item) {

  const definition = item._.model.definition;
  const formTitle = "Folder " + definition.name;
  const viewName = "CatalogFolder";

  const attributes = [];

  const serviceAttributes = [
            "createdAt", "updatedAt", "deletedAt"];
  const hiddenAttributes = ["dropped", "isFolder", 
            "booked", "Date", "parentId", "ownerId", "order"];

  if(definition.owners && definition.owners.length){
    attributes.push({ id: "Owner", header: "Owner", type: "FK", link: "Owner" });
  }

  if(definition.multilevel){
    attributes.push({ id: "Parent", header: "Parent", type: "FK", link: "Parent", onlyFolders: true });
  }

  if(definition.codeLenght > 0){
    attributes.push({ id: "Code", header: "Code" });
  }
  
  attributes.push({ id: "Name", header: "Name" });

  for (let key in definition.attributes) {
    const element = definition.attributes[key];
    if (!serviceAttributes.includes(key) && element.type.dataType != "FK" && element.belonging != "item") {
      let fieldId = element.fieldId;
      if(element.type.lang && element.type.lang.length) {
        fieldId = fieldId + "_" + Application.lang;
      }
      if(!hiddenAttributes.includes(key)) {
        attributes.push({ id: key, header: element.title });
      }
    }
  }

  const rows = [{ view: "Toolbar", name: "Toolbar", owner: viewName, composition: "default", elements: [] }];

  attributes.forEach(row => {
    let viewType;
    if(row.type === "FK") {
      viewType = "Lookup";
    } else {
      viewType = "Text";
    }
    rows.push(
      {
        view: viewType, 
        name: row.id,
        label: row.header,
        dataLink: "item." + row.id,
        onlyFolders: row.onlyFolders
      }
    );
  })

  return {
    view: "View",
    name: viewName,
    header: formTitle,
    rows: rows
  }
}
