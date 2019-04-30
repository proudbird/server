/* globals Tools Application ID ContainerID webix*/

module.exports.Init = function (model, owner, instance) {

  var formTitle = "Look up for " + model.Name;
  var dataSchema = {
    mainObject: {
      cube: model.Cube.Name,
      type: model.Type,
      model: model.Name
    },
    queryOptions: {order: []},
    attributes: []
  };

  if(model.Owner) {
    dataSchema.mainObject.type = model.Owner.Type;
    dataSchema.mainObject.model = model.Owner.Name;
    dataSchema.mainObject.collection = model.Name;
  }

  var columns = [];

  for (const key in model.tableAttributes) {
    if (model.tableAttributes.hasOwnProperty(key)) {
      const element = model.tableAttributes[key];
      columns.push({ id: element.fieldName, header: element.fieldName });
      dataSchema.attributes.push(element.fieldName);
    }
  }

  return {
    view: "Form",
    id: ID,
    containerID: ContainerID,
    name: "Form",
    header: formTitle,
    rows: [
      { 
        view: "Treetable",
        id: Tools.SID(),
        formID: ID,
        name: "List",
        treeType: true,
        dynamic: true,
        autoUpdate: true,
        updateInterval: 30,
        autoConfig: true,
        dataSchema: dataSchema,
        url: Application.Name + '/data?appID=' + Application.ID + '&dataSchema=',
        onItemDblClickCommand: 'select',
        select: true,
        columns: columns
      }
    ]
  }
}
