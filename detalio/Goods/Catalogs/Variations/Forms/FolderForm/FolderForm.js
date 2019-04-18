/* globals Form System Platform Application Tools Cube Master*/

var async = require("async");

Form.OnLoad = function() {
  const catalog = Cube.Catalogs.Attributes;
  catalog
    .Select({where: {IsFolder: true}})
    .then((parents) => {
        async.each(parents, function (parent, Next) {
          let Option = {id: parent.id, value: parent.Name};
          Form.Parent.AddOption(Option, function() {
            Next();
          })
        }, function (Err) {
            Form.Parent.SetCurrentOption(Form.Instance.ParentId);
        });
    })
}

Form.Ok = function() {
  Form.Parent
    .CurrentOption()
    .then(Option => {
      Form.Instance.ParentId = Option ? Option : null;
      Form.Save();
      Form.Close();
    });
}