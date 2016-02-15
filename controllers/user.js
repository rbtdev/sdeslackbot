var UserModel = require('../models/user.js');
var Bot = require('../bot');

var controller = {

	create: function (req, res, next) {
		var isSlackUser = Bot.slack.getUserByEmail(req.body.user.email.toLowerCase())
		console.log("isSlackUser:" + isSlackUser)
		if (isSlackUser) {
			console.log("User exists in slack team.");
			var user = new UserModel({
				email: req.body.user.email.toLowerCase(),
				password: req.body.user.password,
				name: req.body.user.name,
				avatar: req.body.user.avatar,
				isAdmin: false,
			});
			user.save(function (err) {
				if (!err) {
					user.password = undefined;
					return res.status(200).send({});
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