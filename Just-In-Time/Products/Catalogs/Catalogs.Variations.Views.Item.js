View.onLoad = function () {

}

View.Combinations_onLookup = function (params) {
  const type = params.item[params.attribute].getType();
  const options =  {
    purpose: "select",
    caller: View
  }
  if(params.attribute === "Value") {
    options.owner = params.item.Attribute;
  }
  
  type
    .show({ options })
    .then(result => {
      params.item[params.attribute] = result;
      let name = [];
      Item.Combinations.forEach(colItem => {
        name.push(colItem.Attribute.Name + ": " + colItem.Value.Value);
      });
      Item.Name = name.join("; ");
    })
}