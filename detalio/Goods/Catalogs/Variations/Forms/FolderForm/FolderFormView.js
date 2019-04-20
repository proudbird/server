/* globals Tools Application ID ContainerID webix*/
var UploaderListID = _.SID();
module.exports.Init = function (Instance) {
  return {
    view: "Form",
    id: ID,
    containerID: ContainerID,
    name: "Form",
    header: 'New folder',
    rows: [{
        id: _.SID(),
        formID: ID,
        view: "Toolbar",
        name: "Toolbar",
        elements: [{
          id: _.SID(),
          formID: ID,
          view: "Menu",
          name: "Menu",
          data: [
            { id: _.SID(), formID: ID, value: 'OK', onMenuItemClickCommand: 'Ok' }
          ],
          type: { subsign: true }
        }]
      },
      {
        view: 'layout',
        id: _.SID(),
        formID: ID,
        name: 'Layout',
        type: 'form',
        cols: [{
            rows: [
              {
                view: 'Text',
                id: _.SID(),
                formID: ID,
                name: 'Name',
                label: 'Name',
                value: Instance.Name,
                dataBind: 'Instance.Name'
              },
              {
                view: 'Richselect',
                id: _.SID(),
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
