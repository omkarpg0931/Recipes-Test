'use strict';
module.exports = (sequelize, DataTypes) => {
  var recipe_comment = sequelize.define('recipe_comment', {
    fk_recipe_id: DataTypes.INTEGER,
    fk_user_id: DataTypes.INTEGER,
    comment: DataTypes.TEXT
  }, {
    tableName: 'recipes_comments'
  });
  recipe_comment.associate = function(models) {
    // associations can be defined here
    recipe_comment.belongsTo(models.user, {
      foreignKey: 'fk_user_id',
      constraints: false
    });

    recipe_comment.belongsTo(models.recipe, {
      foreignKey: 'fk_recipe_id',
      constraints: true
    }); 
  };
  return recipe_comment;
};