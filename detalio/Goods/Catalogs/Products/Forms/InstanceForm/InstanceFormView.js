/* globals Tools Application ID ContainerID webix*/
var UploaderListID = Tools.SID();
module.exports.Init = function (Instance) {
  return { 
    containerID: ContainerID,
    header: 'Product',
    cols: [  
      {
        view: "Form",
        id: ID,
        name: "Form",
        header: 'Product',
        minWidth: 800,
        maxWidth: 1000,
        rows: [
          {
            id: Tools.SID(),
            formID: ID,
            view: "Menu",
            name: "Menu",
            data: [
              { id: Tools.SID(), formID: ID, value: 'OK', onMenuItemClickCommand: 'Ok' }
            ],
            type: { subsign: true }
          },
          {
            view: 'layout',
            id: Tools.SID(),
            formID: ID,
            name: 'Layout',
            type: 'form',
            cols: [{
                rows: [
                  {
                    view: 'lookup',
                    id: Tools.SID(),
                    formID: ID,
                    name: 'Owner',
                    label: 'Owner',
                    instance: Instance.Owner,
                    dataLink: { cube: "Goods", class: "Catalogs", type: "Products" },
                    dataBind: 'Instance.Owner'
                  },
                  {
                    cols: [
                      {
                        view: 'Text',
                        id: Tools.SID(),
                        formID: ID,
                        name: 'Name',
                        label: 'Name',
                        value: Instance.Name,
                        dataBind: 'Instance.Name'
                      },
                      {
                        view: 'Text',
                        id: Tools.SID(),
                        formID: ID,
                        name: 'SKU',
                        label: 'SKU',
                        value: Instance.SKU,
                        dataBind: 'Instance.SKU'
                      },
                      {
                        view: 'Text',
                        id: Tools.SID(),
                        formID: ID,
                        name: 'Code',
                        label: 'Code',
                        value: Instance.Code,
                        dataBind: 'Instance.Code'
                      }
                    ]
                  },
                  {
                    view: 'Text',
                    id: Tools.SID(),
                    formID: ID,
                    name: 'FullName',
                    label: 'Full name',
                    value: Instance.FullName,
                    dataBind: 'Instance.FullName'
                  },
                  {
                    view: 'Text',
                    id: Tools.SID(),
                    formID: ID,
                    name: 'Description',
                    label: 'Description',
                    value: Instance.Description,
                    dataBind: 'Instance.Description'
                  },
                  {
                    view: 'lookup',
                    id: Tools.SID(),
                    formID: ID,
                    name: 'Parent',
                    label: 'Category',
                    instance: Instance.Parent,
                    dataLink: { cube: "Goods", class: "Catalogs", type: "Products" },
                    dataBind: 'Instance.Parent'
                  },
                  {
                    cols: [
                      {
                        view: 'lookup',
                        id: Tools.SID(),
                        formID: ID,
                        name: 'ProductSort',
                        label: 'Product sort',
                        labelWidth: 110,
                        instance: Instance.ProductSort,
                        dataLink: { cube: "Goods", class: "Catalogs", type: "ProductSorts" },
                        dataBind: 'Instance.ProductSort'
                      },
                      {
                        view: 'lookup',
                        id: Tools.SID(),
                        formID: ID,
                        name: 'ProductType',
                        label: 'Product type',
                        labelWidth: 110,
                        instance: Instance.ProductType,
                        dataLink: { cube: "Goods", class: "Catalogs", type: "ProductTypes" },
                        dataBind: 'Instance.ProductType'
                      }
                    ]
                  },
                  {
                    cols: [
                      {
                        view: 'lookup',
                        id: Tools.SID(),
                        formID: ID,
                        name: 'Producer',
                        label: 'Producer',
                        instance: Instance.Producer,
                        dataLink: { cube: "Goods", class: "Catalogs", type: "Producers" },
                        dataBind: 'Instance.Producer'
                      },
                      {
                        view: 'lookup',
                        id: Tools.SID(),
                        formID: ID,
                        name: 'Brand',
                        label: 'Brand',
                        instance: Instance.Brand,
                        dataLink: { cube: "Goods", class: "Catalogs", type: "Brands" },
                        dataBind: 'Instance.Brand'
                      }
                    ]
                  },
                  {
                    cols: [
                      {
                        view: 'lookup',
                        id: Tools.SID(),
                        formID: ID,
                        name: 'Unit',
                        label: 'Unit',
                        width: 170,
                        instance: Instance.Unit,
                        dataLink: { cube: "Goods", class: "Catalogs", type: "Units" },
                        dataBind: 'Instance.Unit'
                      },
                      {
                        view: 'Text',
                        id: Tools.SID(),
                        formID: ID,
                        name: 'WeightNetto',
                        label: 'Weight netto',
                        labelWidth: 110,
                        width: 170,
                        type: "number",
                        attributes:{
                          step: "0.001"
                        },
                        value: Instance.WeightNetto,
                        dataBind: 'Instance.WeightNetto'
                      },
                      {
                        view: 'Text',
                        id: Tools.SID(),
                        formID: ID,
                        name: 'WeightBrutto',
                        label: 'Weight brutto',
                        labelWidth: 110,
                        width: 170,
                        type: "number",
                        attributes:{
                          step: "0.001"
                        },
                        value: Instance.WeightBrutto,
                        dataBind: 'Instance.WeightBrutto'
                      },
                      {
                        view: 'lookup',
                        id: Tools.SID(),
                        formID: ID,
                        name: 'HSCode',
                        label: 'HS code',
                        instance: Instance.HSCode,
                        dataLink: { cube: "Goods", class: "Catalogs", type: "HSCodes" },
                        dataBind: 'Instance.HSCode'
                      }
                    ]
                  },
                  {
                    view: 'Checkbox',
                    id: Tools.SID(),
                    formID: ID,
                    name: 'HasVariants',
                    label: 'Has variants',
                    value: Instance.HasVariants,
                    dataBind: 'Instance.HasVariants'
                  },
                  {
                    view: 'lookup',
                    id: Tools.SID(),
                    formID: ID,
                    name: 'Variation',
                    label: 'Variation',
                    instance: Instance.Variation,
                    dataLink: { cube: "Goods", class: "Catalogs", type: "Variations" },
                    dataBind: 'Instance.Variation'
                  },
                  {}
                ]
              }
            ]
          }
        ]
      },
      {}
    ]
  }
}