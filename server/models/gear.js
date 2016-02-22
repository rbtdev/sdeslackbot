var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    action: String, //  need, have, got, gave
    qualifier: String, // l1,l2,l3,l4,l5,l6,l7,l7,r,vr, <areea for keys>
    item: String, // shields, axas, bursters, resos, ultras, cubes, keys
    needsDate: { type: Date, expires: 24*60*60 }, // expire a needs in 24 hours
	user: String, // slack user who created this 
});
var model = mongoose.model('gear', schema);


var preSave = function (next) {

};

var postSave = function (next) {

}

module.exports = model;