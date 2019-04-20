/* globals _ Application View */
const path = require('path');

View.onInit = function (callback) {

  Log.debug("Window initialization");
  callback();
}

View.onLoad = async function (params) {

  const sidebar = [{
      parent: {
        id: _.SID(),
        value: "Common"
      },
      items: [{
          id: _.SID(),
          value: "Countries",
          command: "openForm",
          cube: "Common",
          class: "Catalogs",
          type: "Countries"
        },
        {
          id: _.SID(),
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
        id: _.SID(),
        value: "Enterprise"
      },
      items: [{
        id: _.SID(),
        value: "Partners",
        command: "openForm",
        cube: "Enterprise",
        class: "Catalogs",
        type: "Partners"
      }]
    },
    {
      parent: {
        id: _.SID(),
        value: "Products"
      },
      items: [{
          id: _.SID(),
          value: "Products",
          command: "openForm",
          cube: "Products",
          class: "Catalogs",
          type: "Products"
        },
        {
          id: _.SID(),
          value: "Brands",
          command: "openForm",
          cube: "Products",
          class: "Catalogs",
          type: "Brands"
        },
        {
          id: _.SID(),
          value: "Producers",
          command: "openForm",
          cube: "Products",
          class: "Catalogs",
          type: "Producers"
        },
        {
          id: _.SID(),
          value: "Attributes",
          command: "openForm",
          cube: "Products",
          class: "Catalogs",
          type: "Attributes"
        },
        {
          id: _.SID(),
          value: "Variations",
          command: "openForm",
          cube: "Products",
          class: "Catalogs",
          type: "Variations"
        },
        {
          id: _.SID(),
          value: "HSCodes",
          command: "openForm",
          cube: "Products",
          class: "Catalogs",
          type: "HSCodes"
        },
        {
          id: _.SID(),
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