var Messenger = require('./messenger');
var find = require('./find.js');
var messenger = new Messenger();


var str2argv = require('string-argv');
var argvParser = require('minimist');

function sendMotd() {
	var message = this;
	var responseText = "To cancel this message type `@intel motd stop " + message.id + "`\n" + "*" + message.text + "*";
	if (message.command) {
		var argv = str2argv.parseArgsStringToArgv(this.command);

		find(argvParser(argv.splice(1)), function (response) {
			response.text = responseText;
			console.log("response = " + JSON.stringify(response))
			message.channel.postMessage(response);
		});
	}
	else {
		message.channel.post({text: responseText});
	}
};

function motd (hook, args,channel, respond) {
	var errorMessage = null;
	console.log("args = " + JSON.stringify(args))
	var attachments = [];
	if (args._.length) {
		var command = args._[0].toLowerCase();
		switch (command) {
			case 'stop':
				if (args._.length > 1) {
					var messageId = args._[1];
					if (messenger.clearById(messageId)) {
						respond({text: "Message " + messageId + " cleared."})
					}
					else {
						respond({text: "No message with id = " + messageId + " was found."})
					}
				}
				else {
					respond({text: "Please specify a message ID."});
				}
			break;
			case 'list':
				var messages = messenger.messages();
				var attachments = [];
				messages.forEach(function (message) {
					var text = ""
					var fields = [
		                {
		                    title: "ID",
		                    value: message.id,
		                    short: true
		                },
		                {
		                    title: "Text",
		                    value: message.text,
		                    short: true
		                },		                {
		                    title: "Interval (min)",
		                    value: message.interval/60,
		                    short: true
		                },			                {
		                    title: "Command",
		                    value: message.command,
		                    short: true
		                }			                
        			];
					var attachment = {
						title: "Message details:",
						text: text,
						fallback: message.text,
						fields: fields,
						mrkdwn_in: ["text"]
					}
					attachments.push(attachment);				
				});
				respond({text: "List of messages:", attachments: attachments})
			break;
			case 'help':
			break
		}
	}
	else {
		var text = args.m?args.m:"";
		var location = args.l;
		args.r = args.r?parseInt(args.r):0;
		var repeat = isNaN(args.r)?0:args.r;
		if ((args.r) && (repeat < 1)) {
			respond({text: "Repeat interval must be greater than 1 min"});
		}
		else {
			var start = args.s;
			var end = args.e;
			var commandStr = null;
			if (location) {
				var commandStr = "find " + location;
			}
			var message = messenger.createMessage({
				text: text,
				interval: repeat*60,
				command: commandStr,
				channel: channel,
				cb: sendMotd
			});
			sendMotd.bind(message)();
		}
	}
};

module.exports = motd;
