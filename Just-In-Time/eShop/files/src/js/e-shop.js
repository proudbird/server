window.onload = function() {
  callServer("index", {});
}

server.on("start", () => {
  callServer("mainView", {}, (viewCngig) => {
    console.log("Building view...");
    webix.ui(viewCngig);
  });
})

webix.protoUI({
	name: "fullpage",
	defaults: {
    borderless: true,
		sections: []
	},
	$init: function(config){
    var self = this;
    config.sections = [];
    config.fullpageConfig = {};
    config.fullpageConfig.sections = [];
    config.fullpageConfig.anchors = [];
    config.fullpageConfig.menuItems = [];

    setTimeout(function() {
      self.$view.style.height = "100%";
    }, 1);
  },
	show: function(){
    const config = this.config.fullpageConfig;
    this.$view.innerHTML = "<div id='fullpage'>" + config.sections.join("\n") + "</div>";
    var fullPageMenu = document.createElement("DIV");
    fullPageMenu.setAttribute("id", "menu-container");
    document.body.appendChild(fullPageMenu);
    fullPageMenu.innerHTML += "<ul id='menu'>\n" + config.menuItems.join("\n") + "\n</ul>";

		this.sections = new fullpage('#fullpage', {
      anchors: config.anchors,
      menu: '#menu',
      lazyLoad: true
    });

    this.config.sections.forEach(section => {
      const div = this.$view;
      const container = div.getElementsByClassName("fp-tableCell")[0];
      container.id = section.container;
      webix.ui(section);
    })
  },
  addView: function(section) {
    const sectionId = section.id + "_c";
    section.container = sectionId + "c"
    this.config.sections.push(section);
    const config = this.config.fullpageConfig;
    config.sections.push("<div class='section' id='" + sectionId + "'></div>");
    var anchor = sectionId + "_a";
    config.anchors.push(anchor);
    if(config.active) {
      config.menuItems.push('<li data-menuanchor="' + anchor + '" class="active"><a href="#' + anchor + '">' + section.title + '</a></li>');
    } else {
      config.menuItems.push('<li data-menuanchor="' + anchor + '"><a href="#' + anchor + '">' + section.title + '</a></li>');
    }
  },
  moveToSection: function(sectionId) {
    this.sections.moveTo(sectionId + '_a');
  }
}, webix.ui.view);
