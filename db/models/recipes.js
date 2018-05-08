'use strict';
module.exports = (sequelize, DataTypes) => {
  var recipe = sequelize.define('recipe', {
    title: DataTypes.STRING,
    image_url: DataTypes.STRING,
    description: DataTypes.TEXT,
    ingredients: DataTypes.TEXT,
    active: {
      type : DataTypes.BOOLEAN,
      defaultValue : true
    }
  }, {});
  recipe.associate = function(models) {
    // associations can be defined here
    recipe.hasMany(models.recipe_comment, {
      foreignKey: 'fk_recipe_id',
      constraints: true
    });
  };
  return recipe;
};