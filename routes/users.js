var express = require('express');
var router = express.Router();
var userController = require('../controllers/user');
/* GET users listing. */
router.post('/login', userController.login);

router.post('/register', userController.register);

module.exports = router;
