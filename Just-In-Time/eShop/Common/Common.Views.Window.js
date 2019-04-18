/* globals __ROOT Tools Platform Application Form */

View.onLoad = async function(Params) {
  console.log("Main view is loaded");
  for (let x = 1; x < 9; x++) {
    await Cube.Common.Views("page_0" + x).show();
  }

  const menuItems = [
    "Home", "Bedding", "Bedspreads", 
    "Cushion covers", "About flax", 
    "About us", "Shop", "Shopping cart"
  ]
  menuItems.forEach((item, index) => {
    View.Menu.add({ id: "menuItem_" + index, value: item });
  });
  View.Menu.selectByIndex(6);
}

View.ViewContainer_onShow = function(id) {
  const view = Application.views[id];
  if(view) {
    const index = parseInt(view.name.slice(view.name.length-1)) - 1;
    View.Menu.selectByIndex(index);
  }
}

View.Menu_onSelectChange = function(item) {
  View.ViewContainer.setActiveIndex(item.id.slice(item.id.length-1));
}