// var async = require('async');
var validator = require('validator');
var models = require("../db/models");
var errors = require('../errors.json');
var _ = require('../helpers/lodash.js');
var fileHelper = require('../helpers/fileupload.js');

function addNewRecipe(recipe) {
    models.recipe.create(recipe)
    .then(function(result) {
        var pickKeys = ['id'];	
        return null, _.pick(result.dataValues, pickKeys);
    }).catch(function(err) {
        return err, null;
    });
}

exports.create = function(req, res) {
    var recipeData = req.body;
    var error = null
    var data = []
	var keys = ['title','description'];
    if (!recipeData) {
		res.status(400).send(errors.error.emptyFieldErr);
		return;
	} else {
        async.waterfall([
            function(callback) {
                if (req.files.file) {
                    var file = req.files.file;
                    error, uploaded = fileHelper.uploadFileGdrive(file)
                    if (error) {
                        return callback(error, null)
                    } else {
                        return callback(null, uploaded)
                    }
                } else {
                    return callback(null, req.body);
                }
            },
            function(image_url, callback) {
                recipeData = _.keysRequired(keys, recipeData);
                recipeData.image_url = image_url;
                error, addedRecipe = addNewRecipe(recipeData);
                if (error) {
                    return callback(error, null)
                } else {
                    return callback(null, addedRecipe)
                }	
            },
        ], function(err, addedRecipe) {
            if (err) {
                res.status(err.code).send(err.message);
            } else {				
                res.status(200).send(addedRecipe);
            }
        });
	}
};

exports.viewRecipe = function(req, res) {
    var reqParams = req.query;

    if(!reqParams) {
        res.status(401).send("Invalid params");
    } else if(!reqParams.id) {
        res.status(401).send("Invalid recipe");
    } else {
        models.recipe.findOne({ where: {id: reqParams.id, active: true},
            attributes : ['title', 'discription', 'ingredients', 'id', 'image_url'],
            include: [{
                model: models.recipe_comment,
                attributes: ['comment', 'createdAt'],
                required: false,
                include: {
                    model: models.user,
                    attributes: ['name']
                }
            }]
        })
        .then(function(recipeData) {
            if(!recipeData) {
                res.status(401).send("Recipe not found");
            } else {
                res.status(200).send(recipeData);
            }                
        }).catch(function (err) {
            res.status(500).send('Internal server error');
            apiLog.log(req, res)
        });
    }
}

exports.viewRecipesList = function(req, res) {

    models.recipe.findAll({ where: {active: true},
        attributes : ['title', 'discription', 'id', 'image_url'],
    })
    .then(function(recipeData) {
        if(!recipeData) {
            res.status(401).send("Recipes not available");
        } else {
            res.status(200).send(recipeData);
        }                
    }).catch(function (err) {
        res.status(500).send('Internal server error');
        apiLog.log(req, res)
    });
}
