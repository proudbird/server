/* globals Tools Application ID ContainerID webix*/
module.exports.Init = function (Master) {
  return {
    view: "Form",
    id: ID,
    containerID: ContainerID,
    container: "page_01",
    name: "Form",
    css: "cover",
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
                template: "<h1>Linen Home Textile<h2>"
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
                  { view: "Button", formID: ID, width: 130, css: "d-button", value: "learn more", onItemClickCommand: "moveToPage_02" },
                  { view: "Button", formID: ID, width: 130, css: "d-button", value: "shop now", onItemClickCommand: "moveToPage_07" }
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