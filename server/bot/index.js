var Slack = require('slack-client');
var Brain = require('./brain.js');

var Bot = {

	brain: new Brain(),

	connect: function (token) {
		var autoReconnect = true;
		var autoMark = true;
		var slack = new Slack(token, autoReconnect, autoMark);
		this.slack = slack;

		slack.on('open', function() {

			var channels = [],
			    groups = [],
			    unreads = slack.getUnreadCount(),
			    key;

			for (key in slack.users) {
				var user = slack.getUserByID(key)
				console.log("user name = " + user.name + " user email = " + user.profile.email);
			};
			console.log("ROB  = " + slack.getUserByEmail("rob.thuleen@gmail.com"));
			console.log("nobody = " + slack.getUserByEmail("who@who.com"));
			for (key in slack.channels) {
				if (slack.channels[key].is_member) {
					channels.push('#' + slack.channels[key].name);
				}
			}

			for (key in slack.groups) {
				if (slack.groups[key].is_open && !slack.groups[key].is_archived) {
					groups.push(slack.groups[key].name);
				}
			}

			console.log('Welcome to Slack. You are @%s of %s', slack.self.name, slack.team.name);
			console.log('You are in: %s', channels.join(', '));
			console.log('As well as: %s', groups.join(', '));
			console.log('You have %s unread ' + (unreads === 1 ? 'message' : 'messages'), unreads);
		}.bind(this));

		slack.on('message', function(message) {

			console.log("activy = " + JSON.stringify(message))
			var type = message.type;
			var channel = slack.getChannelGroupOrDMByID(message.channel);
			var user = slack.getUserByID(message.user);
			console.log("USER = " + message.user);
			var time = message.ts;
			var text = message.text;
			var upload = ((message.upload) && 
						  (message.file.initial_comment) &&
						  (message.file.initial_comment.comment.split(' ')[0] === '<@' + slack.self.id + '>'))
			//console.log('Received: %s %s @%s %s "%s"', type, (channel.is_channel ? '#' : '') + channel.name, user.name, time, text);
			if (
				(type === 'message') && 
				((text.split(' ')[0] === '<@' + slack.self.id + '>') || upload)
				) {
				var _this = this;
				message.text = upload?"@" + slack.self.id + "> upload":message.text;
				this.brain.exec(message, channel, function (response) {
					channel.postMessage(response);
					console.log('@%s responded with "%s"', slack.self.name, response);
				});
			}
		}.bind(this));

		slack.on('error', function(error) {

			console.error('Error: %s', error);
		}.bind(this));

		slack.login();
	}
}

module.exports = Bot;