/* globals Tools Application ID ContainerID webix*/
module.exports.Init = function (Master) {
  return {
    view: "Form",
    id: ID,
    containerID: ContainerID,
    container: "page_07",
    name: "Form",
    css: "page_07",
    cols: [
      {
        view: "template",
        gravity: 0.3333,
        autoheight: true,
        borderless: true, 
        template: "<h1>Bedding</h1>"
      },
      {
        gravity: 0.3333,
        autoheight: true,
        borderless: true,
        rows: [
          {
            view: "label",
            id: _.SID(), 
            formID: ID,
            name: "lblBedspreads",
            label: "Bedspreds",
            onItemClickCommand: "shopBedspread"
          }
        ]
      },
      {
        view: "template",
        gravity: 0.3333,
        autoheight: true,
        borderless: true, 
        template: "<h1>Cushion covers</h1>"
      }
    ]
  }
}