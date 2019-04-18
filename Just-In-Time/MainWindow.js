/* globals Tools Application View */
const path = require('path');

View.onInit = function (callback) {

  Log.debug("Window initialization");
  callback();
}

View.onLoad = async function (params) {

  const sidebar = [{
      parent: {
        id: Tools.SID(),
        value: "Common"
      },
      items: [{
          id: Tools.SID(),
          value: "Countries",
          command: "openForm",
          cube: "Common",
          class: "Catalogs",
          type: "Countries"
        },
        {
          id: Tools.SID(),
          value: "Units",
          command: "openForm",
          cube: "Common",
          class: "Catalogs",
          type: "Units"
        }
      ]
    },
    {
      parent: {
        id: Tools.SID(),
        value: "Enterprise"
      },
      items: [{
        id: Tools.SID(),
        value: "Partners",
        command: "openForm",
        cube: "Enterprise",
        class: "Catalogs",
        type: "Partners"
      }]
    },
    {
      parent: {
        id: Tools.SID(),
        value: "Products"
      },
      items: [{
          id: Tools.SID(),
          value: "Products",
          command: "openForm",
          cube: "Products",
          class: "Catalogs",
          type: "Products"
        },
        {
          id: Tools.SID(),
          value: "Brands",
          command: "openForm",
          cube: "Products",
          class: "Catalogs",
          type: "Brands"
        },
        {
          id: Tools.SID(),
          value: "Producers",
          command: "openForm",
          cube: "Products",
          class: "Catalogs",
          type: "Producers"
        },
        {
          id: Tools.SID(),
          value: "Attributes",
          command: "openForm",
          cube: "Products",
          class: "Catalogs",
          type: "Attributes"
        },
        {
          id: Tools.SID(),
          value: "Variations",
          command: "openForm",
          cube: "Products",
          class: "Catalogs",
          type: "Variations"
        },
        {
          id: Tools.SID(),
          value: "HSCodes",
          command: "openForm",
          cube: "Products",
          class: "Catalogs",
          type: "HSCodes"
        },
        {
          id: Tools.SID(),
          value: "ProductSorts",
          command: "openForm",
          cube: "Products",
          class: "Catalogs",
          type: "ProductSorts"
        }
      ]
    }
  ]

  let parentId;

  sidebar.forEach(async item => {
    parentId = await View.Sidebar.add(item.parent);
    item.items.forEach(async subItem => {
      await View.Sidebar.add(subItem, undefined, parentId);
    })
  })

  // const p = require.resolve("c:\\ITProjects\\cubismo\\core\\UI\\DefaultViews\\Catalogs.Views.List.Config.js");
  // if (require.cache[p]) {
  //   delete require.cache[p];
  // }

  // Application.Enterprise.Catalogs.Partners.show({
  // });

  Application.Products.Catalogs.Variations.show({
  });
}

View.Sidebar_onItemClick = function (item) {
  Application[item.cube][item.class][item.type].show();
}