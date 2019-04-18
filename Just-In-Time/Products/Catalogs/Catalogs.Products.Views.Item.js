View.onLoad = function () {
  let isFolder = true;
  if (View.item.Parent) {
    isFolder = View.item.Parent.isFolder();
  }
  setVisibilityParent(isFolder);
  setVisibilityVariants(View.item.HasVariants);
}

View.Parent_onChange = function (value) {
  if (!value) {
    setVisibilityParent(true);
    setVisibilityVariants(false);
  } else {
    const isFolder = value.isFolder();
    setVisibilityParent(isFolder);
    if (View.item.HasVariants) {
      View.item.HasVariants = false;
      setVisibilityVariants(false);
    }
    if(!isFolder && !Item.Name) {
      const name = value.Name;
      Item.Name = name;
    }
  }
}

View.hasVariants_onChange = function (value) {
  setVisibilityVariants(value);
}

function setVisibilityParent(value) {
  if (!value) {
    View.HasVariants.hide();
    View.ProductSet.hide();
    View.Variation.show();
  } else {
    View.HasVariants.show();
    View.ProductSet.show();
    View.Variation.hide();
  }
}

function setVisibilityVariants(value) {
  if (value) {
    View.VariationSet.hide();
    View.AttributesSet.show();
  } else {
    View.VariationSet.show();
    View.AttributesSet.hide();
  }
}