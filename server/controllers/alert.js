var AlertModel = require('../models/alert.js');

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
	console.log("Creating alert: " + JSON.stringify(alert));
	return alert;
}
module.exports = {
	model: AlertModel,
	create: create
};