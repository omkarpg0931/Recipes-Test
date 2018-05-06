var _ = require('lodash');
var lodash = {};


lodash.keysRequired = function (requiredKeys, obj) {	
	var obj = this.pick(obj, requiredKeys);
	return _.every(requiredKeys, _.partial(_.has, obj)) ? obj : false;
};
lodash.removeUndefined = function (obj) {
	return _(obj).omitBy(_.isUndefined).omitBy(_.isNull).value();
};

lodash.omit = function (obj, keyArray) {
	return _.omit(obj, keyArray);
};

lodash.pick = function (obj, keyArray) {
	var obj = this.removeUndefined(obj);
	return _.pick(obj, keyArray);
};
lodash.findIndex = function (list, key, value){
	return _.findIndex(list, function(o) { return o.key == value; });
};
module.exports = lodash;