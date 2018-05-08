var express = require('express');
var router = express.Router();
var recipeController = require('../controllers/recipe');
var tokenHelper = require('../helpers/token');
var multiparty = require('connect-multiparty');
var  multipartyMiddleware = multiparty();

/* GET recipes listing. */
router.get('/', recipeController.viewRecipe);

router.get('/all', recipeController.viewRecipesList);

router.post('/', tokenHelper.checkAuth, multipartyMiddleware, recipeController.create);

module.exports = router;