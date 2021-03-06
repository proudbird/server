/* globals Tools Application ID ContainerID webix*/
var UploaderListID = _.SID();
module.exports.Init = function (Master) {
  return {
    view: "Form",
    id: ID,
    containerID: ContainerID,
    name: "Form",
    header: 'Variations',
    rows: [
      {
        id: _.SID(),
        formID: ID,
        view: "Menu",
        name: "Menu",
        data: [
          { id: _.SID(), formID: ID, value: 'New', onMenuItemClickCommand: 'New' },
          { id: _.SID(), formID: ID, value: 'Delete', onMenuItemClickCommand: 'Delete' }
        ],
        type: { subsign: true }
      },
      { 
        cols: [
          {
            view: "Treetable",
            id: _.SID(),
            formID: ID,
            name: "List",
            treeType: true,
            dynamic: true,
            autoUpdate: true,
            updateInterval: 30,
            autoConfig: true,
            dataSchema: { 
                mainObject: { cube: "Goods", type: "Catalogs", model: "Variations" },
                queryOptions: {order: [["Name", "ASC"]]},
                attributes: ["id", "Code", "Name"]
              },
            url: Application.Name + '/data?appID=' + Application.ID + '&dataSchema=',
            onItemDblClickCommand: 'OpenItem',
            select: true,
            columns:[              
              { id:"Name", header:"Name", fillspace:true, template:"{common.treetable()} #Name#" }
            ]
          }
        ]
      }
    ]
  }
}
