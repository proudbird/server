/* globals __ROOT Tools Platform DBTypes*/
var CatalogAttributes = 
  {
    Name: 'Attributes',
    Cube: 'Goods',
    Type: 'Catalogs',
    Alias: 'Attribute'
  };

  var CatalogAttributesValues = 
  {
    Name: 'Attributes',
    Cube: 'Goods',
    Type: 'Catalogs',
    Collection: 'Values',
    Alias: 'Value'
  };

var Combination = 
  {
    Name: 'Combination',
    Cube: 'Goods',
    Type: 'Collections',
    Owner:  {
      Name: 'Variations',
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
      BelongsTo: [CatalogAttributes, CatalogAttributesValues]
    }
  };

var Parent = 
  {
    Name: 'Variations',
    Cube: 'Goods',
    Type: 'Catalogs',
    Alias: 'Parent'
  };

var Definition = 
  {
    Name: 'Variations',
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
      Name:       DBTypes.STRING(150)
    },
    Config: {
      timestamps: false
    },
    Associations: {
      BelongsTo: [Parent],
      HasMany: [Combination]
    }
  };
  
  module.exports = Definition;