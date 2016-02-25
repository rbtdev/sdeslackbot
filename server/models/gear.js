var mongoose = require('mongoose');
var moment = require('moment');

var expiration = 60*60*24; // 1 day in seconds
var schema = new mongoose.Schema({
    action: String, //  need, have, got, gave
    qualifier: String, // l1,l2,l3,l4,l5,l6,l7,l7,r,vr, <areea for keys>
    item: String, // shields, axas, bursters, resos, ultras, cubes, keys
    createdOn: { type: Date, expires: expiration }, // expire a post in 24 hours
	user: String, // slack user who created this 
	matches : [{ type: mongoose.Schema.Types.ObjectId, ref: 'gear' }]
});

schema.virtual('expiresOn')
.get(function () {
	var createdOn = new Date(this.createdOn);
	var expiresOn = createdOn.setSeconds(createdOn.getSeconds() + expiration);
	return expiresOn;
});

schema.index({action: 1, qualifier: 1, item: 1, user: 1}, {unique: true});
var model = mongoose.model('gear', schema);

schema.pre('save', function (next) {
	var inverseAction = (this.action=="need")?"have":"need";
	var _this = this;
	console.log("checking for inverse conflict: " + this.user + " cannot have a " + inverseAction);

	model.find({'user':this.user, 'qualifier':this.qualifier, 'item': this.item, 'action': inverseAction}, function (err, docs) {
		console.log("Docs = " + JSON.stringify(docs));
		if (err) return next(err);
		if (docs && docs.length > 0) {
			 var err = new Error("You cant 'need' and 'have' the same items.");
			 console.log("Error inside pre save: " + JSON.stringify(err));
			 console.log("Error message inside pre save: " + err.message);
			return next(err);
		}
		_this.createdOn = new Date();
		next();
	})

});


module.exports = model;