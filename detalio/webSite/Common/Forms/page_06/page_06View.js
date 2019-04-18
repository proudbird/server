/* globals Tools Application ID ContainerID webix*/
module.exports.Init = function (Master) {
  return {
    view: "Form",
    id: ID,
    containerID: ContainerID,
    container: "page_06",
    name: "Form",
    css: "page_06",
    rows: [
      {},
      {
        css: "cover_title",
        cols: [
          { width: 300 },
          {
            maxWidth: 600,
            rows: [
              {
                view: "template",
                autoheight: true,
                borderless: true, 
                template: "<h1>About us<h2>"
              },
              {
                view: "template",
                autoheight: true,
                borderless: true,
                template: "<h3>Nature is not ideal. Well, flax fibers too.<h3>"
              },
              { height: 30 },
              {
                cols: [
                  { view: "Button", width: 130, css: "d-button", value: "learn more", click: function() { location.hash = "#2"; } },
                  { view: "Button", width: 130, css: "d-button", value: "shop now", click: function() { location.hash = "#7"; } }
                ]
              },
              { height: 30 }
            ]
          },
          {}
        ]
      },
      {}
    ]
  }
}