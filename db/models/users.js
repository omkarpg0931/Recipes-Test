'use strict';
module.exports = (sequelize, DataTypes) => {
  var user = sequelize.define('user', {
    password: DataTypes.STRING,
    email_id: DataTypes.STRING(100),
    name: DataTypes.STRING(100),
    is_admin: {
      type : DataTypes.BOOLEAN,
      defaultValue : false
    },
    active: {
      type : DataTypes.BOOLEAN,
      defaultValue : true
    }
  }, {});
  user.associate = function(models) {
    // associations can be defined here
    user.hasMany(models.recipe_comment, {
      foreignKey: 'fk_user_id',
      constraints: false
    });
  };
  return user;
};