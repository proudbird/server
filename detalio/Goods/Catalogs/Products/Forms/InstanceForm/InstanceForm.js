/* globals Form System Platform Application Tools Cube Master*/

var async = require("async");

Form.Ok = function() {
  Form.Save();
  Form.Close();
}

Form.Add = function() {
  Form.Combination.Add();
}

Form.Remove = function() {
  Form.Combination.GetSelectedItems(function(SelectedItems) {
    if(SelectedItems) {
      Form.Combination.Remove(SelectedItems, function() {
        changeName();
      });
    }
  });
}

Form.combination_afterLookUp = function() {
  changeName();
}

function changeName() {
  var name = [];
  for(i = 0; i < Form.Instance.Combination.length; i++) {
    let combination = Form.Instance.Combination[i];
    name.push(combination.Attribute.Name + ": " + combination.Value.Value);
  }
  Form.Instance.Name = name.join("; ");
}