/* globals __ROOT Tools Platform Application Form */

Form.OnLoad = function(Params) {
  for (let x = 1; x < 9; x++) {
    Application.webSite.Form("page_0" + x).Show();
  }
}