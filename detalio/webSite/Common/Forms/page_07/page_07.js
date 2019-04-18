Form.shopBedspread = function() {
  Cube.Form("shopPoduct").Show({ gategory: "bedspread"}, true, {Width: 500, Height: 300}, function(response) {
    Tools.Dialog.message(response);
  });
}