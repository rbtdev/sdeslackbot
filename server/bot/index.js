var Slack = require('slack-client');
var Brain = require('./brain.js');
var UserModel = require('../models/user.js');

function onOpen () {
	var slack = this.slack;
	var unreads = slack.getUnreadCount();
	console.log('Welcome to Slack. You are @%s of %s', slack.self.name, slack.team.name);
	console.log('You have %s unread ' + (unreads === 1 ? 'message' : 'messages'), unreads);
}


function onMessage (message) {

	var slack = this.slack;
	var type = message.type;
	var channel = slack.getChannelGroupOrDMByID(message.channel);
	var user = slack.getUserByID(message.user);
	var time = message.ts;
	var text = message.text?message.text:" ";
	var isMessage = (message.type === "message")
	var botUser = "<@" + slack.self.id + ">";
	var firstWord = text.split(' ')[0];
	var isShortcut = firstWord.charAt(0) === "."
	var isForMe = ((firstWord === botUser) || isShortcut);

	if (isMessage && isForMe) {
		if (isShortcut) {
			message.text = botUser + " " + message.text.slice(1);
		}
		this.brain.exec(user, message, channel, function (response) {
			response.as_user = true;
			channel.postMessage(response);
		});
	}
}

function onUserChange (slackUser) {
	console.log("User Changed: " + slackUser.id);
	console.log("User data:" + JSON.stringify(slackUser))
	UserModel
		.findOne({slackId: slackUser.id})
		.exec(function (err, user) {
			if (user) {
				user.slackName = slackUser.name;
				user.email = slackUser.profile.email;
				user.avatar = slackUser.profile.image_192;
				user.isAdmin = slackUser.is_admin;
				user.isDisabled= slackUser.deleted;
			    return user.save(function (err) {
			      if (!err) {
			      	console.log("User Changed: " + JSON.stringify(user));
			      } else {
			        console.log("Error updating user");
			      }
			    });
			}
			else {
				console.log("SLack User not found: " + slackUser.name)
			}
	  	});
}

function onError (error) {
		console.error('Error: %s', error);
}

var Bot = {

	brain: new Brain(),

	sendDM: function (user, message, cb) {
		var params = {
			"unfurl_links": false,
			"unfurl_media": false,
			"as_user": false,
		    "channel": "@" + user.name,
		    "text": message,
		    "username":  this.slack.self.name
			}
		this.slack._apiCall("chat.postMessage", params, function (res) {
			console.log("DM Response: " + JSON.stringify(res));
			var err = null;
			if (!res.ok) {
				err = res.error
			}
			if (cb) {
				cb(err);
			}
		});
	},

	connect: function (token) {
		var autoReconnect = true;
		var autoMark = true;
		var slack = new Slack(token, autoReconnect, autoMark);
		this.slack = slack;

		// Set up event handlers
		slack
			.on('open', onOpen.bind(this))
			.on('message', onMessage.bind(this))
			.on('error', onError.bind(this))
			.on('userChange', onUserChange.bind(this));

		slack.login();
	}
}

module.exports = Bot;