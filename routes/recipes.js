var express = require('express');
var router = express.Router();
var recipeController = require('../controllers/recipe');
var tokenHelper = require('../helpers/token')

/* GET recipes listing. */
router.get('/', recipeController.viewRecipe);

router.get('/all', recipeController.viewRecipesList);

router.post('/', tokenHelper.checkAuth, recipeController.create);

module.exports = router;