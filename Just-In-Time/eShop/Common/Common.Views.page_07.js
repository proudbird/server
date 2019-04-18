

View.btnShop_onClick = async function(value) {
  switch (value) {
    case 1:
      const result = await Application.Products.Catalogs.Products.select({ where: {Code: "1"} });
      const item = result[0];
      Cube.Common.Views("shopProduct", { item: item })
        .showModal()
        .then(result => {
          console.log(result);
        })
      break;
  }
}