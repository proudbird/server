module.exports.Init = (sequelize, DataTypes) => {
  const Users = sequelize.define('sysUsers', {
      id: {
          type:         DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey:   true,
          unique:       true
        },
      Login:    DataTypes.STRING(25),
      Password: DataTypes.STRING
    },
    {
      timestamps: false
    }
  );

  Users.prototype.Message = function(message) {
    var Message = {};
    Message.Directive = 'Message';
    Message.Value = message;
    this.Client.emit('message', Message, function(Response) {
      if(callback) callback(Response);
    });
  }
};