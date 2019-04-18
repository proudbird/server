/* globals __ROOT Tools Platform Application Form */

Form.OnLoad = function(Params) {
  //Application.Goods.Catalogs.Producers.New().ShowForm();
  // let int = Application.DBConnection;
  // int.query("SELECT schema_name FROM information_schema.schemata WHERE schema_name <> 'information_schema' AND schema_name != 'public';")
  //   .then((schema) => {
  //     //console.log(schema);
  //   });

  //   int.query("SELECT con.* FROM pg_catalog.pg_constraint con INNER JOIN pg_catalog.pg_class rel ON rel.oid = con.conrelid INNER JOIN pg_catalog.pg_namespace nsp ON nsp.oid = connamespace WHERE nsp.nspname = 'public' AND rel.relname = 'catGoods_Products'; ")
  //   .then((schema) => {
  //     console.log(schema);
  //   });
}

Form.OpenMenuItem = function(item) {
  Application[item.cube][item.class][item.type].ShowForm("ListForm");
}