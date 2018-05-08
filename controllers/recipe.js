var async = require('async');
var validator = require('validator');
var models = require("../db/models");
var errors = require('../errors.json');
var _ = require('../helpers/lodash.js');
var fileHelper = require('../helpers/fileupload.js');
var tokenHelper = require('../helpers/token.js');
const qs = require('querystring');

function addNewRecipe(recipe, file) {
    
    models.recipe.create(recipe)
    .then(function(result) {
        id = result.dataValues.id;
        fileHelper.uploadFiletodrive(file, id);
        var pickKeys = ['id'];	
        return null, _.pick(result.dataValues, pickKeys);
    }).catch(function(err) {
        return err, null;
    });
}

function addRecipeComment(comment) {
    models.recipe_comment.create(comment)
    .then(function (result) {
        var pickKeys = ['id'];
        return null, _.pick(result.dataValues, pickKeys);
    }).catch(function (err) {
        return err, null;
    });
}

exports.create = function(req, res) {
    var recipeData = req.body;    
    var err = null
    var data = []
    try{
        if (!recipeData) {
            res.status(400).send(errors.error.emptyFieldErr);
            return;
        } else {
            var file= null;
            if (req.files != undefined && req.files.file) {
                file = req.files.file;
            }
            recipeData = JSON.parse(recipeData.data)
            
            var data = {
                "description":recipeData.description,
                "title": recipeData.title,
                "ingredients": recipeData.ingredients
            }
            err, addedRecipe = addNewRecipe(data, file);
            if (err) {               
                res.status(err.code).send(err.message);
            } else {				
                res.status(200).send(addedRecipe);
            }
        }
	} catch (err) {
		console.log(err);
		
		return res.sendStatus(500);
	}
};

exports.addComment = function (req, res) {
    var commentData = req.body;
    var error = null
    var data = []
    var keys = ['comment', 'id'];
    if (!commentData) {
        res.status(400).send(errors.error.emptyFieldErr);
        return;
    } else {
        async.waterfall([
            function (callback) {
                var token = req.headers['authorization'];
                decoded_token = tokenHelper.decodeToken(token)
                return callback(null, decoded_token)
            },
            function (decoded_token, callback) {
                
                var data = {
                    "comment": commentData.comment,
                    "fk_user_id" : decoded_token.id,
                    "fk_recipe_id" : commentData.id,
                }
                error, addedComment = addRecipeComment(data);
                if (error) {
                    return callback(error, null)
                } else {
                    return callback(null, addedComment)
                }
            },
        ], function (err, addedComment) {
            if (err) {
                res.status(err.code).send(err.message);
            } else {
                res.status(200).send(addedComment);
            }
        });
    }
};

exports.viewRecipe = function(req, res) {
    var reqParams = req.query;
    try{
        if(!reqParams) {
            res.status(401).send("Invalid params");
        } else if(!reqParams.id) {
            res.status(401).send("Invalid recipe");
        } else {
            models.recipe.findOne({ where: {id: reqParams.id, active: true},
                attributes : ['title', 'description', 'ingredients', 'id', 'image_url', 'createdAt'],
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
                    userData = recipeData.get({plain : true});
                    
                    res.status(200).send(recipeData);
                }                
            }).catch(function (err) {
                res.status(500).send('Internal server error');
            });
        
        }
    } catch (error){
        res.status(500).send('Internal server error');
        
    }
}

exports.viewRecipesList = function(req, res) {

    models.recipe.findAll({ where: {active: true},
        attributes : ['title', 'description', 'id', 'image_url', 'createdAt'],
    })
    .then(function(recipeData) {
        if(!recipeData) {
            res.status(401).send("Recipes not available");
        } else {
            res.status(200).send(recipeData);
        }                
    }).catch(function (err) {        
        res.status(500).send('Internal server error');
    });
}
