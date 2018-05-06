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
	var token = getToken(req.headers);
	try{
		var decoded = jwt.verify(token, SECRET);
		if (decoded.user_type){
			next();
		} 
		else{
			return res.send(401);
		}
	} catch (err) {
		return res.send(500);
	}
	
};

exports.decodeToken = function (token) {
	return jwt.decode(token);
};