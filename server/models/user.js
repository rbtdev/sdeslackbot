var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var acl = require('mongoose-acl');

var SALT_WORK_FACTOR = 10;

var userSchema = new mongoose.Schema({
	email: {type: 'string', unique: 'true'},
	password: {type: 'string', select: 'false'},
	name: 'string',
	avatar: 'string',
	isAdmin: 'boolean',
	slackName: 'string',
	slackId: 'string',
	isDisabled: 'boolean',
	activationKey: mongoose.Schema.Types.ObjectId,
	pwResetKey: mongoose.Schema.Types.ObjectId
});

userSchema.plugin(acl.subject);
userSchema.pre('save', function(next) {
    var user = this;

	// only hash the password if it has been modified (or is new)
	if (!user.isModified('password')) return next();

	// generate a salt
	bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
	    if (err) return next(err);

	    // hash the password using our new salt
	    bcrypt.hash(user.password, salt, function(err, hash) {
	        if (err) return next(err);

	        // override the cleartext password with the hashed one
	        user.password = hash;
	        next();
	    });
	});


});

userSchema.methods.comparePassword = function(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};

var UserModel = mongoose.model('user', userSchema);

module.exports = UserModel;
