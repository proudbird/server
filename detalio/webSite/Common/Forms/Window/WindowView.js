/* globals Tools Application ID ContainerID webix*/
module.exports.Init = function(Master) {
  return {
    id: ID,
    name: "Window",
    view: "Window",
    css: "window",
    container: "conteiner",
    rows: [{
      id: 'FormsBar',
      name: "FormsBar",
      view: 'fullpage',
      sections: [
        { id: "page_01", title: "Home", menuTitle: "Home", active: true },
        { id: "page_02", title: "Bedding", menuTitle: "Bedding"},
        { id: "page_03", title: "Bedspreads", menuTitle: "Bedspreads"},
        { id: "page_04", title: "Cushion covers", menuTitle: "Cushion covers"},
        { id: "page_05", title: "About flax", menuTitle: "About flax"},
        { id: "page_06", title: "About us", menuTitle: "About us"},
        { id: "page_07", title: "Shop", menuTitle: "Shop"},
        { id: "page_08", title: "Shopping cart", menuTitle: "Shopping cart"}
      ]
    }]
  }
}