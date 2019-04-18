/* globals Tools Application ID ContainerID webix*/
var UploaderListID = Tools.SID();
module.exports.Init = function (Instance) {
  return {
    view: "Form",
    id: ID,
    containerID: ContainerID,
    name: "Form",
    header: 'Variation',
    rows: [
      {
        id: Tools.SID(),
        formID: ID,
        view: "Menu",
        name: "Menu",
        data: [
          { id: Tools.SID(), formID: ID, value: 'OK', onMenuItemClickCommand: 'Ok' }
        ],
        type: { subsign: true }
      },
      {
        view: 'layout',
        id: Tools.SID(),
        formID: ID,
        name: 'Layout',
        type: 'form',
        cols: [{
            rows: [
              {
                view: 'Text',
                id: Tools.SID(),
                formID: ID,
                name: 'Name',
                label: 'Name',
                value: Instance.Name,
                dataBind: 'Instance.Name'
              },
              {
                rows: [
                  {
                    id: Tools.SID(),
                    formID: ID,
                    view: "Menu",
                    name: "CombinationMenu",
                    data: [
                      { id: Tools.SID(), formID: ID, value: 'Add', icon: "plus", onMenuItemClickCommand: 'Add' },
                      { id: Tools.SID(), formID: ID, value: 'Remove', icon: "remove", onMenuItemClickCommand: 'Remove' }
                    ],
                    type: { subsign: true }
                  },
                  {
                    view: 'Datatable',
                    id: Tools.SID(),
                    formID: ID,
                    name: 'Combination',
                    label: 'Combination',
                    data: Tools.dataToJSON(Instance.Combination),
                    dataBind: "Instance.Combination",
                    editable: true,
                    editaction: "dblclick",
                    afterLookUpCommand: "combination_afterLookUp",
                    select: true,
                    multiselect:true,
                    scroll: "x",
                    header: true,
                    columns:[
                      { id: "Attribute", header: "Attribute", fillspace: true, 
                        template: function(obj) {
                          return obj.Attribute ? obj.Attribute.Name : "";
                        },
                        dataLink: { cube: "Goods", class: "Catalogs", type: "Attributes" }
                      },
                      { id: "Value", header: "Value", fillspace: true, template: function(obj) {
                        return obj.Value ? obj.Value.Value : "";
                      },
                      dataLink: { cube: "Goods", class: "Catalogs", type: "Attributes", collection: "Values", connection: "Attribute" }
                    }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
}
