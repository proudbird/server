/* globals Form System Platform Application Tools Cube Master*/

Form.OpenItem = function() {
  Form.List.GetSelectedItems(function(SelectedItems) {
    if(SelectedItems) {
      let instance = SelectedItems[0];
      instance.ShowForm('InstanceForm', {Caller: Form});
    }
  });
};

Form.New = function() {
  let instance = Cube.Catalogs.Variations.New();
  instance.ShowForm('InstanceForm', {Caller: Form});
};

Form.NewFolder = function() {
  let folder = Cube.Catalogs.Variations.NewFolder();
  folder.ShowForm(undefined, {Caller: Form});
};

Form.Delete = function() {
  Form.List.GetSelectedItems(function(SelectedItems) {
    if(SelectedItems) {
      let item = SelectedItems[0];
      item.Delete(true, function() {
        Form.List.Refresh();
      });
    }
  });
};