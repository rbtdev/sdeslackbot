var mongoose = require('mongoose');

var alertSchema = new mongoose.Schema({
		portal_name: String,
		latitude: String,
		longitude: String,
		attacker: String,
		portal_image_url: String,
		portal_url:  String,
		attacker_url: String
});


var AlertModel = mongoose.model('alert',alertSchema);
module.exports = AlertModel;
