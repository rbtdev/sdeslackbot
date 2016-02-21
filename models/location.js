var mongoose = require('mongoose');
//var acl = require('mongoose-acl');

var locationSchema = new mongoose.Schema({
    name: String,
    area: String,
    lat: Number,
    lng: Number,
    intelUrl: {type: 'string', unique: 'true'}, // only one unique location
    mapsUrl: String,
    shortCode: String,
    method: String,
	user: { type: mongoose.Schema.ObjectId, ref: 'user' }
});
locationSchema.index({ name: 'text', area: 'text', shortCode: 'text'}); // full text search

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


module.exports = LocationModel;