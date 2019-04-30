/* globals Tools Application ID ContainerID webix*/
module.exports.Init = function (item) {

  const definition = item._.model.definition;
  const formTitle = "Item " + definition.name;
  const viewName = "CatalogItem";

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
  
  attributes.push({ id: "Name", header: "Name", fieldId: "Name", langs: definition.nameLang });

  for (let key in definition.attributes) {
    const element = definition.attributes[key];
    if (!serviceAttributes.includes(key) && element.belonging != "folder") {
      let fieldId = element.fieldId;
      multilang = false;
      if(element.type.lang && element.type.lang.length) {
        fieldId = fieldId + "_" + Application.lang;
        multilang = true;
      }
      if(!hiddenAttributes.includes(key)) {
        attributes.push({ 
          id: key, 
          header: element.title, 
          type: element.type.dataType, 
          fieldId: element.fieldId,
          langs: element.type.lang
        });
      }
    }
  }

  const rows = [{ view: "Toolbar", name: "Toolbar", owner: viewName, composition: "default", elements: [] }];

  attributes.forEach(row => {
    let viewType;
    if(row.type === "FK") {
      viewType = "Lookup";
    } else if(row.type === "BOOLEAN") {
      viewType = "Checkbox";
    } else  {
      viewType = "Text";
    }
    rows.push(
      {
        view: viewType, 
        name: row.id,
        label: row.header,
        dataLink: "item." + row.id,
        onlyFolders: row.onlyFolders,
        fieldId: row.fieldId,
        langs: row.langs
      }
    );
  })

  let hasTables = false;
  if(definition.collections) {
    Tools.forOwn(definition.collections, collection => {
      const subRows = { rows: [{ view: "Toolbar", name: "Toolbar", owner: collection.name, composition: "default", elements: [] }] };
      const columns = [];

      const column = {
        id: "order", 
        header: "Lp.", 
        width: 30
      }
      columns.push(column);

      for (let key in collection.attributes) {
        const element = collection.attributes[key];
        if (!serviceAttributes.includes(key)) {
          let editor = "text";
          if(element.type.dataType === "FK") {
            editor = "lookup";
          }
          const column = {
            id: key, 
            header: element.title, 
            editor: editor,
            fillspace: true,
            langs: element.type.lang, 
          }
          columns.push(column);
        }
      }

      const table = {
        view: 'Datatable',
        name: collection.name,
        label: collection.name,
        dataLink: "item." + collection.name,
        editable: true,
        editaction: "dblclick",
        select: true,
        multiselect:true,
        scroll: "x",
        header: true,
        columns: columns
      }
      subRows.rows.push(table);
      rows.push(subRows);
      hasTables = true;
    }); 
  }

  if(!hasTables) {
    rows.push({});
  }
  
  return {
    view: "View",
    name: viewName,
    header: formTitle,
    rows: rows
  }
}
