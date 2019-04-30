const sysTables = {
  SY_Nummirators: {
    config: {
      timestamps: false,
      freezeTableName: true
    },
    attributes: {
      id: {
        type: DBTypes.UUID,
        defaultValue: DBTypes.UUIDV4,
        primaryKey: true,
        unique: true
      },
      reference: {
        type: DBTypes.STRING(11),
      },
      period: {
        type: DBTypes.DATE,
        defaultValue: null
      },
      parent: {
        type: DBTypes.UUID,
        defaultValue: null,
      },
      number: {
        type: DBTypes.STRING(25),
        defaultValue: null,
      }
    }
  }
};

function define(db) {

  for(let tableName in sysTables) {
    const table = sysTables[tableName];
    db.define(tableName, table.attributes, table.config);
  }
}

module.exports.define = define;