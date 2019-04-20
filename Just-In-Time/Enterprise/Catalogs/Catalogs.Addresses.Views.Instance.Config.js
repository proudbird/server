/* globals _ Application ID ContainerID webix*/
var UploaderListID = _.SID();
module.exports.Init = function (Instance) {
  return {
    view: "Form",
    id: ID,
    containerID: ContainerID,
    name: "Form",
    header: 'Agreement',
    rows: [
      {
        id: _.SID(),
        formID: ID,
        view: "Menu",
        name: "Menu",
        data: [
          { id: _.SID(), formID: ID, value: 'OK', onMenuItemClickCommand: 'Ok' }
        ],
        type: { subsign: true }
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
                view: 'Text',
                id: _.SID(),
                formID: ID,
                name: 'Code',
                label: 'Code',
                value: Instance.Code,
                dataBind: 'Instance.Code'
              },
              {
                view: 'Text',
                id: _.SID(),
                formID: ID,
                name: 'Number',
                label: 'Number',
                value: Instance.Number,
                dataBind: 'Instance.Number'
              },
              {
                view: 'datepicker',
                id: _.SID(),
                formID: ID,
                name: 'Date',
                label: 'Date',
                value: Instance.Date,
                dataBind: 'Instance.Date'
              },
              {}
            ]
          }
        ]
      }
    ]
  }
}
