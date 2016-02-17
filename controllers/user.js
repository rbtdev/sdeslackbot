var UserModel = require('../models/user.js');
var Bot = require('../bot');
var mongoose = require('mongoose');

var controller = {

	activate: function (req, res, next) {
		var activationKey = req.params.activationKey;
		UserModel
			.findOne({activationKey:activationKey})
			.exec(function (err, user) {
				if (!err) {
					if (user) {
						user.activationKey = null;
						user.save(function (err) {
							if (!err) {
								res.redirect('/#/activate-success');
							}
							else {
								res.status(500).send(err);
							}
						});
					}
					else {
						res.status(404).send("Activation key not found");
					}
				}
				else {
					res.status(500).send(err);
				}
			})
	},

	create: function (req, res, next) {
		var slackUser = Bot.slack.getUserByEmail(req.body.user.email.toLowerCase())
		console.log("slackUser:" + slackUser)
		if (slackUser && !slackUser.isDisabled) {
			console.log("User exists in slack team.");
			var user = new UserModel({
				email: req.body.user.email.toLowerCase(),
				password: req.body.user.password,
				name: req.body.user.name,
				avatar: slackUser.profile.image_192,
				slackName: slackUser.name,
				slackId: slackUser.id,
				isAdmin: slackUser.is_admin,
				activationKey: 	mongoose.Types.ObjectId()
			});
			user.save(function (err) {
				if (!err) {
					user.password = undefined;
					// send activation code to user on slack
					var activationMessage = "To activate your SDE Intel Web account click here: " + 
											"https://intelbot.herokuapp.com/activate/" + 
											 user.activationKey;
             		Bot.sendDM(slackUser, activationMessage, function (err) {
             			if (!err) {
             				// Send User Creation notification to ME!! :)
	             			var devUser = Bot.slack.getUserByID("U03MC5YDB");
	             			if (devUser) {
	             				Bot.sendDM(devUser, "New Intelbot user: " + user.slackName);
	             			}
             				return res.status(200).send({});
             			}
             			else {
             				return res.status(403).send(err);
             			}
             		});
				} else {
             		return res.status(403).send(err);
				}
			});
		}
		else {
			console.log("User is not in slack team.");
			return res.status(403).send({});
		}
	},

	readMany: function(req, res, next) {
		UserModel
			.find()
			.select("-password")
			.exec(function(err, users) {
		    	res.status(200).send({user:users});
		    });
	},

	readOne: function (req, res, next) {
		UserModel
			.findById(req.params.id)
			.select("-password")
			.exec(function (err, user) {
				if (!err) {
					res.status(200).send({user:user});
				}
				else {
					res.status(500).send(err);
				}
			})
	},

	update: function (req, res, next) {
		UserModel
			.findById(req.params.id)
			.exec(function (err, user) {
				user.email = req.body.user.email;
				user.name =  req.body.user.name;
				user.avatar = req.body.user.avatar;
				user.isAdmin = false;
			    return user.save(function (err) {
			      if (!err) {
			      	res.status(200).send({user:user});
			      } else {
			        res.status(404).send(err);
			      }
			    });
		  	});
	},
	setResetPwRequest: function (req, res, next) {
		var email = req.body.passwordResetRequest.email.toLowerCase()
		console.log('Email: ' +  email);
		var slackUser = Bot.slack.getUserByEmail(email)
		UserModel
			.findOne({email: email})
			.exec(function (err, user) {
				if (!err) {
					if (user) {
						user.pwResetKey = mongoose.Types.ObjectId();
						user.save (function (err) {
							if (!err) {
								var resetMessage = "Your password is ready to be reset. Please click here to reset your password:" + 
											"https://intelbot.herokuapp.com/#/password-reset?pwResetKey=" + 
											 user.pwResetKey;
		             			Bot.sendDM(slackUser, resetMessage, function (err) {
			             			if (!err) {
			             				// Send User Creation notification to ME!! :)
				             			var devUser = Bot.slack.getUserByID("U03MC5YDB");
				             			if (devUser) {
				             				Bot.sendDM(devUser, "Password Reset request: " + user.slackName);
				             			}
			             				return res.status(200).send({});
			             			}
			             			else {
			             				return res.status(403).send(err);
			             			}
								});
							}
							else {
								return res.status(403).send(err);
							}
						});
					}
					else {
						return res.status(404).send(err);
					}
				}
				else {
					return res.status(403).send(err);
				}
			});
	},

	resetPw: function (req, res, next) {
		var pwResetKey = req.body.passwordReset.pwResetKey;
		console.log("PW reset key = " + pwResetKey)
		UserModel.findOne({pwResetKey: pwResetKey})
			.exec(function (err, user) {
				if (!err) {
					if (user) {
						console.log("User = " + user.email);
						user.password = req.body.passwordReset.newPw;
						user.pwResetKey = null;
						user.save(function (err, user) {
							if (!err) {
								res.status(200).send({});
							}
						});
					}
					else {
						//not found
						res.status(404).send({});

					}
				}
				else {
					res.status(500).send({});
				}
			})
	}


};

module.exports = controller;