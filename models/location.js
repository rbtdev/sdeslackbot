var mongoose = require('mongoose');
var Geo = require('../lib/geo');

//var acl = require('mongoose-acl');

var locationSchema = new mongoose.Schema({
    name: String,
    area: String,
    lat: Number,
    lng: Number,
	geo: { 
		type: [Number],  // [<longitude>, <latitude>]
    	index: '2dsphere'      // create the geospatial index
    },
    intelUrl: {type: 'string', unique: 'true'}, // only one unique location
    mapsUrl: String,
    shortCode: String,
    method: String,
	user: { type: mongoose.Schema.ObjectId, ref: 'user' }
});
locationSchema.index({ name: 'text', area: 'text', shortCode: 'text'}); // full text search

function preSave(next) {
	if (!this.name || !this.intelUrl || !this.area) {
		return next (new Error());
	}
	if ((this.name.length == 0) || (this.intelUrl.length ==0) || (this.area.length == 0)) {
		return next (new Error());
	}

	/// Passed basic validation
	var location = new Geo.Location(this.intelUrl);
	this.lat = location.geo[0];
	this.lng = location.geo[1];
	this.geo = location.geo;
	this.mapsUrl = "http://maps.google.com/?q=" + this.name + "@" + this.lat + "," + this.lng;
	next();
};

function preFind() {
	this.where({'method': {$ne: 'upload'}});
};

locationSchema.pre('save', preSave);
//locationSchema.pre('find', preFind);
//locationSchema.plugin(acl.object);
var LocationModel = mongoose.model('location',locationSchema);
var OutgressLocation = mongoose.model('outgress_location', locationSchema);

module.exports = LocationModel;