var mongoose = require('mongoose');
//var acl = require('mongoose-acl');

var locationSchema = new mongoose.Schema({
    name: String,
    area: String,
    intelUrl: String,
    mapsUrl: String,
    shortCode: String,
	//author: { type: mongoose.Schema.ObjectId, ref: 'user' }
});

//locationSchema.plugin(acl.object);

var LocationModel = mongoose.model('location',locationSchema);
module.exports = LocationModel;