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
								res.redirect('/');
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
		if (slackUser) {
			console.log("User exists in slack team.");
			var user = new UserModel({
				email: req.body.user.email.toLowerCase(),
				password: req.body.user.password,
				name: req.body.user.name,
				avatar: slackUser.profile.image_192,
				slackName: slackUser.name,
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

	readAll: function(req, res) {
		UserModel
			.find({})
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
	}
};

module.exports = controller;