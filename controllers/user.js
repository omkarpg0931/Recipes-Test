// var async = require('async');
var validator = require('validator');
var bcrypt = require('bcrypt');
var models = require("../db/models");
var errors = require('../errors.json');
var _ = require('../helpers/lodash.js');
var jwtToken = require('../helpers/token.js');

function registerNewUser(userData) {
    models.user.findOne({ where: {email_id: userData.email_id},
        attributes : ['id'],
    })
    .then(function(user) {
        if(!user) {
            var password = bcrypt.hashSync(userData.password, 10);
            userData.password = password;
            models.user.create(userData)
            .then(function(result) {
                var pickKeys = ['id'];	
                return null, _.pick(result.dataValues, pickKeys);
            }).catch(function(err) {
                return err, null;
            });
        } else {
            err = {}
            err.code = 401
            err.message = "Email Id already registered"
            return err, null;
        }
    });
}

exports.register = function(req, res) {
	var userData = req.body;
    var error = null
    var data = []
	var keys = ['name', 'password', 'email_id'];

	userData = _.keysRequired(keys, userData);

	if (!userData) {
		res.status(400).send(errors.error.emptyFieldErr);r
	} else if (!validator.isEmail(userData.email_id)) {
		res.status(400).send(errors.error.invalidEmailErr);
	} else {
        error, registeredUser = registerNewUser(userData);
        if (error) {
            res.status(error.code).send(error.message);
        } else {
            res.status(200).send(registeredUser);
        }	
	}
};

exports.login = function(req, res) {
    var loginData = req.body;

    loginData.username = (loginData.username || '').toLowerCase().trim()  // Changing email to lower
    loginData.password = (loginData.password || '') .trim()

    if(!loginData.username || !validator.isEmail(loginData.username)) {
        res.status(401).send(errors.error.invalidEmailErr);
    } else if(!loginData.password) {
        res.status(401).send(errors.error.invalidCredentials);
    } else {
        models.user.findOne({ where: {email_id: loginData.username},
            attributes : ['name', 'password', 'email_id', 'id', 'is_admin'],
        })
        .then(function(user) {            
            if(!user) {
                res.status(401).send(errors.error.invalidCredentials);
            } else {
                var userData = user.get({plain : true});
                
                var match = bcrypt.compareSync(loginData.password, userData.password);
                
                if(match){
                    var user = {
                        'name' : userData.name,
                        'id': userData.id,
                        'user_type': userData.is_admin
                    };

                    message = {
                        'token' : jwtToken.generateJwtToken(user),
                        'message': "Login Successful"
                    };

                    delete req.body
                    res.status(200).send(message);
                } else {
                    res.status(401).send(errors.error.invalidCredentials);
                }
            }                
        }).catch(function (err) {
            console.log(err);
            res.status(500).send('Internal server error');
        });
    }
}
