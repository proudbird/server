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
          cube: "Cards",
          class: "Catalogs",
          type: "Countries"
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

  Application.Cards.Common.Views("Playground").show();
}

View.Sidebar_onItemClick = function (item) {
  Application[item.cube][item.class][item.type].show();
}