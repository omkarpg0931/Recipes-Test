var jwt = require('jsonwebtoken');
var SECRET = '123$567';

exports.generateJwtToken = function (userData) {
	return jwt.sign(userData, SECRET);
};

exports.checkIfValid = function (token) {
	try{
		var decoded = jwt.verify(token, SECRET);
		return decoded;
	} catch (err) {
		return false;
	}
}

exports.checkAuth = function (req, res, next) {
	var token = req.headers['authorization'];	
	// var token = getToken(req.headers);
	try{
		var decoded = jwt.verify(token, SECRET);
		console.log(decoded);
		
		if (decoded.user_type){
			next();
		} 
		else{
			return res.sendStatus(401);
		}
	} catch (err) {
		console.log(err);
		
		return res.sendStatus(500);
	}
	
};

exports.decodeToken = function (token) {
	return jwt.decode(token);
};