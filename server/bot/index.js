function Bot (token) {

	var Slack = require('slack-client');
	var Brain = require('./brain.js');
	
	this.brain = new Brain();
	var autoReconnect = true;
	var autoMark = true;
	this.slack = new Slack(token, autoReconnect, autoMark);
	this.slack.on('open', function() {

		var channels = [],
		    groups = [],
		    unreads = this.slack.getUnreadCount(),
		    key;

		for (key in this.slack.channels) {
			if (this.slack.channels[key].is_member) {
				channels.push('#' + this.slack.channels[key].name);
			}
		}

		for (key in this.slack.groups) {
			if (this.slack.groups[key].is_open && !this.slack.groups[key].is_archived) {
				groups.push(this.slack.groups[key].name);
			}
		}

		console.log('Welcome to Slack. You are @%s of %s', this.slack.self.name, this.slack.team.name);
		console.log('You are in: %s', channels.join(', '));
		console.log('As well as: %s', groups.join(', '));
		console.log('You have %s unread ' + (unreads === 1 ? 'message' : 'messages'), unreads);
	}.bind(this));

	this.slack.on('message', function(message) {

		console.log("activy = " + JSON.stringify(message))
		var type = message.type;
		var channel = this.slack.getChannelGroupOrDMByID(message.channel);
		var user = this.slack.getUserByID(message.user);
		console.log("USER = " + message.user);
		var time = message.ts;
		var text = message.text;
		var upload = ((message.upload) && 
					  (message.file.initial_comment) &&
					  (message.file.initial_comment.comment.split(' ')[0] === '<@' + this.slack.self.id + '>'))
		//console.log('Received: %s %s @%s %s "%s"', type, (channel.is_channel ? '#' : '') + channel.name, user.name, time, text);
		if (
			(type === 'message') && 
			((text.split(' ')[0] === '<@' + this.slack.self.id + '>') || upload)
			) {
			var _this = this;
			message.text = upload?"@" + this.slack.self.id + "> upload":message.text;
			this.brain.exec(message, channel, function (response) {
				channel.postMessage(response);
				console.log('@%s responded with "%s"', _this.slack.self.name, response);
			});
		}
	}.bind(this));

	this.slack.on('error', function(error) {

		console.error('Error: %s', error);
	}.bind(this));

	this.slack.login();
}

module.exports = Bot;