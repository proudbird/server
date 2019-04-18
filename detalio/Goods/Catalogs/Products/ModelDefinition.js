/* globals __ROOT Tools Platform DBTypes*/
var ProductSorts = 
  {
    Name: 'ProductSorts',
    Cube: 'Goods',
    Type: 'Catalogs',
    Alias: 'ProductSort'
  };

  var HSCodes = 
  {
    Name: 'HSCodes',
    Cube: 'Goods',
    Type: 'Catalogs',
    Alias: 'HSCode'
  };
  var Producers = 
  {
    Name: 'Producers',
    Cube: 'Goods',
    Type: 'Catalogs',
    Alias: 'Producer'
  };

  var Brands = 
  {
    Name: 'Brands',
    Cube: 'Goods',
    Type: 'Catalogs',
    Alias: 'Brand'
  };

  var Units = 
  {
    Name: 'Units',
    Cube: 'Goods',
    Type: 'Catalogs',
    Alias: 'Unit'
  };

  var Variations = 
  {
    Name: 'Variations',
    Cube: 'Goods',
    Type: 'Catalogs',
    Alias: 'Variation'
  };

  var ProductTypes = 
  {
    Name: 'ProductTypes',
    Cube: 'Goods',
    Type: 'Catalogs',
    Alias: 'ProductType'
  };

  var CatalogAttributes = 
  {
    Name: 'Attributes',
    Cube: 'Goods',
    Type: 'Catalogs',
    Alias: 'Value'
  };

  var Attributes = 
  {
    Name: 'Attributes',
    Cube: 'Goods',
    Type: 'Collections',
    Owner:  {
      Name: 'Attributes',
      Cube: 'Goods',
      Type: 'Catalogs'
    },
    Attributes: {
      id: {
        type:         DBTypes.UUID,
        defaultValue: DBTypes.UUIDV4,
        primaryKey:   true,
        unique:       true
      },
      rowNumber: DBTypes.INTEGER
    },
    Config: {
      timestamps: false
    }
    ,
    Associations: {
      BelongsTo: [CatalogAttributes]
    }
  };

  var Parent = 
  {
    Name: 'Products',
    Cube: 'Goods',
    Type: 'Catalogs',
    Alias: 'Parent'
  };

  var Owner = 
  {
    Name: 'Products',
    Cube: 'Goods',
    Type: 'Catalogs',
    Alias: 'Owner'
  };

var Definition = 
  {
    Name: 'Products',
    Cube: 'Goods',
    Type: 'Catalogs',
    Attributes: {
      id: {
          type:         DBTypes.UUID,
          defaultValue: DBTypes.UUIDV4,
          primaryKey:   true,
          unique:       true
        },
      Deleted:   {type: DBTypes.BOOLEAN, defaultValue: false},
      Code: {
          type:          DBTypes.INTEGER,
          autoIncrement: true,
          unique:        true
        },
      IsFolder:   {type: DBTypes.BOOLEAN, defaultValue: false},
      Name:       DBTypes.STRING(150),
      FullName:   DBTypes.STRING(255),
      SKU:        DBTypes.STRING(25),
      Description:   DBTypes.TEXT,
      CareSymbols:   DBTypes.STRING(10),
      WeightNetto:   DBTypes.DECIMAL,
      WeightBrutto:  DBTypes.DECIMAL,
      HasVariants:   {type: DBTypes.BOOLEAN, defaultValue: false},
    },
    Config: {
      timestamps: false
    },
    Associations: {
      BelongsTo: [Parent, Owner, ProductSorts, HSCodes, Producers, Brands, Units, Variations, ProductTypes],
      HasMany: [Attributes]
    }
  };
  
  module.exports = Definition;