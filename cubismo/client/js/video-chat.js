webix.protoUI({
  name: "video",
  defaults: {
    template: function template$$1(config, common) {
      var id = uid();
      var html = "<div><audio id='audio'></audio></div>";
      return common.$renderInput(config, html, id);
    }
  },
  $init: function (config) {
    this.$ready.push(this._Init);
  },
  _Init: function () {
    var constraints = { audio: true, video: { width: 1280, height: 720 } }; 
    navigator.mediaDevices.getUserMedia(constraints)
    .then(function(mediaStream) {
      var video = document.querySelector('video');
      video.srcObject = mediaStream;
      video.onloadedmetadata = function(e) {
        video.play();
      };
    })
    .catch(function(err) { console.log(err.name + ": " + err.message);
  }
}, webix.ui.layout);