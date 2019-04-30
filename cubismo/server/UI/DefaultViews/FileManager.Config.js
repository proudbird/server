/* globals Tools Application ID ContainerID webix*/
module.exports.Init = function (type, options) {

  const formTitle = options.folder ? "Select folder" : "Select file";

  return {
    view: "View",
    name: "FileManager",
    header: formTitle,
    rows: [{
      cols: [
        {
          view: "Tree",
          name: "Tree",
          template:"{common.icon()} {common.folder()} <span>#name#<span>",
          select: true,
          query: "function.view.getFileTree",
          gravity: 0.2,
          editable: true,
          editor: "text",
          editValue: "name",
          editaction: "dblclick",
          events: {
            onBeforeEditStop: "Tree_onBeforeEditStop"
          }
        },
        { view: "resizer"},
        {
          view: "Treetable",
          name: "List",
          select: true,
          columns: [
            { id: "name", header: "Name", fillspace: true }
          ],
          query: "function.view.getFileList",
          gravity: 0.6
        }
      ],
    }]
  }
}
