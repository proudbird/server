Form.shopBedspread = function() {
  Cube.Form("shopPoduct").Show({ gategory: "bedspread"}, true, {Width: 500, Height: 300}, function(response) {
    _.Dialog.message(response);
  });
}