let items;
const Variations = {};
const Attributes = {};
const Values = {};
const Options = {};
const Combinations = {};
let Current;

View.onLoad = async function() {
  await defineVariations();
  addOptions();
}

View.btnOK_onClick = function() {
  View.close("works!!!");
}

View.OptionButton_onItemClick = function(value) {
  const attributeId = value[0];
  const valueId = value[1];

  Current.splice(getAttributeIndex(attributeId), 1, valueId);

  let item = getItem(Current);
  if(item) {
    Item = item;
    setOptionState(View[Values[attributeKey][valueId].Value], "active");
  }

  let find = false;
  Variations;
  Attributes;
  
  for(let attributeKey in Combinations) {
    if(attributeKey === attributeId) {
      // check all attributes, but not currently selected
      continue;
    }
    const combination = _.clone(Current);
    const attributeIndex = getAttributeIndex(attributeKey);
    for(let valueId in Values[attributeKey]) {
      combination.splice(attributeIndex, 1, valueId);
      nItem = getItem(combination);
      if(nItem) {
        find = true;
        if(!item && !find) {
          Item = nItem;
        }
        setOptionState(View[Values[attributeKey][valueId].Value], "active");
      } else {
        setOptionState(View[Values[attributeKey][valueId].Value], "inactive");
      }
    }
  } 
}

function setOptionState(element, state) {
  if(state === "active") {
    element.changeStyle("eshop_button_inactive", "eshop_button");
  } else if(state === "inactive") {
    element.changeStyle("eshop_button", "eshop_button_inactive");
  }
}

function getItem(combination) {
  return _.get(Variations, combination);
}

function getAttributeIndex(attributeId) {
  return Combinations[attributeId].index;
}

async function defineVariations() {
  items = await Application.Products.Catalogs.Products
    .select({ where: { parentId: Item.getValue("id") } });

  const parent = items[0].Parent;
  parent.Attributes.forEach((attribute, index) => {
    const attributeId = attribute.Attribute.getValue("id");
    Combinations[attributeId] = { 
      index: index,
      attribute: attribute.Attribute,
      id: attributeId
    };
  });

  items.forEach(item => {
    const combination = item.Variation.Combinations;
    const values = [];
    for(i=0; i<combination.length; i++) {
      const attributeValue = combination[i];
      const attributeId    = attributeValue.Attribute.getValue("id");
      const valueId        = attributeValue.Value.getValue("id");
      values.push(valueId);
      Options[attributeId] = Options[attributeId] || [];
      Options[attributeId].push(attributeValue.Value);
      Values[attributeId] = Values[attributeId] || {};
      Values[attributeId][valueId] = attributeValue.Value;
      Attributes[valueId] = attributeId;
      if(i === (combination.length-1) && !Current) {
        Current = values;
      }
    }

    let variation = Variations;
    values.forEach((valueId, index) => {
      if(index === (values.length-1)) {
        variation[valueId] = item;
        return;
      }
      variation[valueId] = variation[valueId] || {};
      variation = variation[valueId];
    });
  });
}

function addOptions() {
  _.forIn(Combinations, (combination, combinationKey) => {
    const option = combination.attribute.Name;
    View.Options.addView({
      view: "Group",
      name: option,
      cols: []
    });
    Options[combination.id].forEach((value, index) => {
      const button = {
        view: "Button",
        name: value.Value, 
        label: value.Value,
        value: [combinationKey, value.getValue("id")],
        css: "eshop_button",
        events: { onItemClick: "OptionButton_onItemClick" }
      };
      if(combination.attribute.IsColor) {
        if(value.Path) {
          button.type = "image";
          button.image = "/files/" + value.Path;
          button.width = 60;
          button.height = 60;
          button.css = "eshop_button_swatch";
        }
      }
      View[option].addView(button);
    })
  })
}