/* globals Tools Application ID ContainerID webix*/
module.exports.Init = function (Master) {
  return {
    view: "Form",
    id: ID,
    containerID: ContainerID,
    name: "shopProduct",
    rows: [
      {
        view: "carousel",
        id: "carousel",
        //cols: viewsArray,
        navigation: {
          type: "side",
          items: false
        }
      },
      {
        view: "dataview",
        id: "imageList",
        css: "nav_list",
        yCount: 1,
        select: true,
        scroll: false,
        type: {
          width: 100,
          height: 65
        },
        template: function img(obj){
          return '<img src="'+obj.src+'" class="content" ondragstart="return false"/>'
        },
        //data: images
      },
      {
        view: "Button",
        id: Tools.SID(),
        formID: ID,
        name: "btnClose",
        label: "finish",
        onItemClickCommand: "close"
      }
    ]
  }
}