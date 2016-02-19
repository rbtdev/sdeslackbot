var mongoose = require('mongoose');
//var acl = require('mongoose-acl');

var locationSchema = new mongoose.Schema({
    name: {type: String, index: true },
    area: {type: String, index: true },
    lat: Number,
    lng: Number,
    intelUrl: String,
    mapsUrl: String,
    shortCode: {type: String, index: true },
	//author: { type: mongoose.Schema.ObjectId, ref: 'user' }
});

function _preSave(next) {
	if (!this.name || !this.intelUrl || !this.area) {
		return next (new Error());
	}
	if ((this.name.length == 0) || (this.intelUrl.length ==0) || (this.area.length == 0)) {
		return next (new Error());
	}

	/// Passed basic validation

	var params = this.intelUrl?this.intelUrl.split("pll="):[]
	var llStr = params.length==2?params[1]:"0,0";
	var ll = llStr.split(',');
	this.lat = parseFloat(ll[0]);
	this.lng = parseFloat(ll[1]);
	this.mapsUrl = "http://maps.google.com/?q=" + this.name + "@" + this.lat + "," + this.lng;
	next();
};

function preSave(location, next) {
	_preSave.bind(location)(next);
}

locationSchema.pre('save', _preSave);

//locationSchema.plugin(acl.object);

var LocationModel = mongoose.model('location',locationSchema);

module.exports = {
	model: LocationModel,
	preSave: preSave,
	fieldNames: ["name", "area", "intelUrl", "mapsUrl", "shortCode"]
};