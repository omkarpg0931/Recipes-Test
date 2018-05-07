'use strict';

var fs        = require('fs');
var path      = require('path');
var Sequelize = require('sequelize');
var basename  = path.basename(__filename);
var env       = process.env.NODE_ENV || 'development';
var config    = require(__dirname + '/../../config/config.json')[env];
var db        = {};

let sequelize = new Sequelize(
    config.database, config.username, config.password, config
  );


fs
  .readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(file => {
    var model = sequelize['import'](path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

sequelize
    .authenticate()
    .then(function(err) {
        console.log("Connected to HEROKU ADDON POSTGRESQL Successfully");
        console.log("DATABASE ENVIRONMENT : ", env, ' USER : ', config.username);
    }, function (err) {
        console.error('Unable to connect to the database:', err);
    });

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
