/* globals Tools Application ID ContainerID webix*/
module.exports.Init = function(Master) {
  return {
    id: ID,
    name: "Window",
    view: "Window",
    css: "window",
    rows: [
      {
        id: _.SID(),
        name: "Header",
        view: "template",
        template: "<h3>detalio</h3>",
        height: 60,
      },
      {
        cols: [
          { view: "sidebar", 
            name: "Sidebar",
            id: _.SID(),
            formID: ID,
            width: 150,
            onItemClickCommand: "OpenMenuItem",
            data: [
              { id: _.SID(), value: "Products", command: "OpenForm", cube: "Goods", class: "Catalogs", type: "Products"  },
              { id: _.SID(), value: "Attributes", command: "OpenForm", cube: "Goods", class: "Catalogs", type: "Attributes"  },
              { id: _.SID(), value: "Variations", command: "OpenForm", cube: "Goods", class: "Catalogs", type: "Variations"  },
              { id: _.SID(), value: "Brands", command: "OpenForm", cube: "Goods", class: "Catalogs", type: "Brands"  },
              { id: _.SID(), value: "HS codes", command: "OpenForm", cube: "Goods", class: "Catalogs", type: "HSCodes"  },
              { id: _.SID(), value: "Producers", command: "OpenForm", cube: "Goods", class: "Catalogs", type: "Producers"  },
              { id: _.SID(), value: "Product sorts", command: "OpenForm", cube: "Goods", class: "Catalogs", type: "ProductSorts"  },
              { id: _.SID(), value: "Product types", command: "OpenForm", cube: "Goods", class: "Catalogs", type: "ProductTypes"  },
              { id: _.SID(), value: "Countries", command: "OpenForm", cube: "Main", class: "Catalogs", type: "Countries"  },
              { id: _.SID(), value: "Partners", command: "OpenForm", cube: "Business", class: "Catalogs", type: "Partners"  },
              { id: _.SID(), value: "Agreements", command: "OpenForm", cube: "Business", class: "Catalogs", type: "Agreements"  }
            ],
          },
          {
          id: 'FormsBar',
          name: "FormsBar",
          view: 'tabview',
          tabbar:{
            tabOffset: 0
          },
          multiview:{
            animate:false
          },
          cells: [
            { id: "dummy", header: "  ", }
          ] // need to add dummy tab to init tabview, then will delete it,
          // rigth after initing 
        }]
      }
    ]
  }
}