View.onInit = function (callback) {
  Log.debug("Window initialization");
  callback();
}

View.onLoad = async function (params) {

  const sidebar = [
    {
      parent: {
        id: _.SID(),
        value: "Cards"
      },
      items: [{
          id: _.SID(),
          value: "Cards",
          command: "openForm",
          cube: "Cards",
          class: "Catalogs",
          type: "Cards"
        }
      ]
    },
    {
      parent: {
        id: _.SID(),
        value: "Common"
      },
      items: [{
          id: _.SID(),
          value: "Users",
          command: "openForm",
          cube: "Users",
          class: "Catalogs",
          type: "Users"
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

  Application.Cards.Catalogs.Cards.show();

  View.UserMenuList.add({ 
      id: "profile", 
      value: await getUserName()
    }, 0);
  
    View.UserMenuList.add({ 
      id: "file", 
      value: "File manager"
    });
}

View.Sidebar_onItemClick = function (item) {
  Application[item.cube][item.class][item.type].show();
}

View.UserMenu_onItemClick = async function(item) {

  View.UserMenu.hide();
  
  if(item.id === "profile") {
    const sysUser = await Application.currentUser();
    const result = await Application.Users.Catalogs.Users.select({ where: { FL_gt6pr5IT: sysUser.username }});
    const user = result[0];
    user.show();
  } else if(item.id === "logout") {
    Application.logOut();
  } else {
    Application.selectFolder();
  }
}

async function getUserName() {
  const sysUser = await Application.currentUser();
  const result = await Application.Users.Catalogs.Users.select({ where: { FL_gt6pr5IT: sysUser.username }});
  const user = result[0];
  return user.Name;
}
