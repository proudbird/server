/* globals Tools Application ID ContainerID webix*/
module.exports.Init = function (type, options) {

  const definition = type._.model.definition;
  const formTitle = "Collection " + definition.name;
  const listName = "List";

  const columns    = [];
  const attributes = [];
  const map = {};

  const serviceAttributes = [
            "createdAt", "updatedAt", "deletedAt"];
  const hiddenAttributes = ["id"];
  
  hiddenAttributes.forEach(atr => {
    attributes.push(atr);
    map[atr] = atr;
  })

  attributes.push("ownerId");
  attributes.push("order");

  // if(definition.presentation) {
  //   let attribute = definition.attributes[definition.presentation];
  //   let fieldId = attribute.fieldId;
  //   if(attribute.type.lang && attribute.type.lang.length) {
  //     fieldId = fieldId + "_" + Application.lang;
  //   }
  //   attributes.push(fieldId);
  // }

  for (let key in definition.attributes) {
    const element = definition.attributes[key];
    if (!serviceAttributes.includes(key)) {
      let fieldId = element.fieldId;
      if(element.type.lang && element.type.lang.length) {
        fieldId = fieldId + "_" + Application.lang;
      }
      if(!hiddenAttributes.includes(key)) {
        columns.push({ id: key, header: element.title, fillspace:true });
      }
      attributes.push(fieldId);
      map[fieldId] = key;
    }
  }

  const query = {
    SELECT: attributes,
    FROM:   type._.model.name,
    ORDER:  ["order", "ASC"]
  }

  query.WHERE = [];

  if(options.owner) {
    query.WHERE.push({ EQ: ["ownerId", options.owner.getValue("id")] });
  }

  query.map = map;

  const rows = [];

  rows.push({
    view: "Lookup",
    name: "Owner",
    label: "Owner",
    dataLink: "owner",
    onlyFolders: false
  });

  // rows.push({
  //   view: "Toolbar",
  //   name: "Toolbar",
  //   owner: listName,
  //   composition: "default",
  //   elements: []
  // });

  rows.push({
    view: "Treetable",
    name: listName,
    autoConfig: true,
    treeType: true,
    select: true,
    multiselect: true,
    columns: columns,
    dynamic: true,
    autoUpdate: true,
    updateInterval: 30,
    query: query,
    events: {
      onItemDblClick: listName + "_onItemDblClick"
    }
  });

  return {
    view: "View",
    name: "CatalogList",
    header: formTitle,
    rows: rows
  }
}
