var str2argv = require('string-argv');
var argvParser = require('minimist');
var find = require('./find.js');


var messages = [];
var id = 0;


function newId() {
	return id++;
};



function Message(options) {
	this.text = options.text;
	this.id = newId();
	this.interval = options.interval;
	this.respond = options.respond;
	this.command = options.command;
	this.active = false;
	if (this.interval > 1) {
		this.timer = setInterval(sendMessage(this), this.interval*1000);
		this.active = true;
	}
	this.send = sendMessage(this);
	messages.push(this);
};

function sendMessage(message) {
	return function ()
		{
		var responseText = "";
		if (message.timer) responseText ="To cancel this message type `@intel motd stop " + message.id + "`\n"
		responseText += "*" + message.text + "*";
		console.log("Message.command + " + JSON.stringify(message.command));
		if (message.command) {
			var argv = str2argv.parseArgsStringToArgv(message.command);

			find(argvParser(argv.splice(1)), function (response) {
				response.text = responseText;
				message.respond(response);
			});
		}
		else {
			message.respond({text: responseText});
		}
	}
};


function getActiveMessages() {
	return messages.filter(function (message) {
		return (message.active);
	});
};

function findById(messageId) {
	var found = messages.filter(function(message) {
		return ((message.id == messageId) && (message.active));
	});
	return found.length?found[0]:null;
};

function clearById(messageId) {
	var result = false;
	var message = findById(messageId);
	if (message) {
		result = true;
		clearInterval(message.timer);
		message.active = false;
	}
	return result
}

module.exports = {
	Message: Message,
	findById: findById,
	clearById: clearById,
	getActiveMessages: getActiveMessages
}