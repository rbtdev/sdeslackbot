var AlertModel = require('../models/alert.js');
var LocationModel = require('../models/location.js');

function create(req) {
	console.log('body:' + JSON.stringify(req.body))
	var alert = {
		portal_name: req.body['portal_name'],
		latitude: req.body['latitude'],
		longitude: req.body['longitude'],
		attacker: req.body['attacker'],
		portal_image_url: req.body['portal_image_url'],
		portal_url:  req.body['portal_url'],
		attacker_url: req.body['attacker_url']
	};
	// var location = new LocationModel({
	// 	intelUrl: alert.portal_url,
	// 	name: alert.portal_name,
	// 	area: "unknown",
	// 	shortCode: "",
	// 	method: "outgress"
	// });
	// location.save();
	return alert;
}
module.exports = {
	model: AlertModel,
	create: create
};