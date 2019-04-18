/* globals Tools Application ID ContainerID webix*/
var UploaderListID = Tools.SID();
module.exports.Init = function (Instance) {
  return {
    view: "Form",
    id: ID,
    containerID: ContainerID,
    name: "Form",
    header: 'New folder',
    rows: [{
        id: Tools.SID(),
        formID: ID,
        view: "Toolbar",
        name: "Toolbar",
        elements: [{
          id: Tools.SID(),
          formID: ID,
          view: "Menu",
          name: "Menu",
          data: [
            { id: Tools.SID(), formID: ID, value: 'OK', onMenuItemClickCommand: 'Ok' }
          ],
          type: { subsign: true }
        }]
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
                view: 'Richselect',
                id: Tools.SID(),
                formID: ID,
                name: 'Parent',
                label: 'Parent',
                options: []
              },
              {}
            ]
          }
        ]
      }
    ]
  }
}
