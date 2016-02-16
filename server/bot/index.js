var Slack = require('slack-client');
var Brain = require('./brain.js');



function onOpen () {
	var slack = this.slack;
	var unreads = slack.getUnreadCount();
	console.log('Welcome to Slack. You are @%s of %s', slack.self.name, slack.team.name);
	console.log('You have %s unread ' + (unreads === 1 ? 'message' : 'messages'), unreads);
}

function onMessage (message) {

	var slack = this.slack;

	/// console.log("activy = " + JSON.stringify(message))

	var type = message.type;
	var channel = slack.getChannelGroupOrDMByID(message.channel);
	var user = slack.getUserByID(message.user);

	var time = message.ts;
	var text = message.text;

	var botMessage = ((type === 'message') && (text.split(' ')[0] === '<@' + slack.self.id + '>'))
	if (botMessage) {
		this.brain.exec(message, channel, function (response) {
			channel.postMessage(response);
		});
	}
}

function onUserChange (user) {
	console.log("User Changed: " + user.name)
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
			cb(err);
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