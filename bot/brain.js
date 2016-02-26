var data = require('../models/data');
var argvParser = require('minimist');

// Get the modules in the './commands' directory and create the command list
var normalizedPath = require("path").join(__dirname, "commands");
var BotCommands = {};
require("fs").readdirSync(normalizedPath).forEach(function(file) {
  BotCommands[file] = require("./commands/" + file);
});


module.exports = function Brain() {
	this.exec = exec;

	function help (respond) {
		var attachments = [];
		response = "*Welcome to the SDE Slack Team Bot*\n\n";
		response += "*The following commands are now available*\n";

		for (command in BotCommands) {
			var attachment = {};
			attachment.mrkdwn_in = ["text", "pretext"]
			var preText = "";
			preText += "`" + command + "`";
			if (BotCommands[command].usage) {
				preText += " `" + BotCommands[command].usage + "`";
			}
			var commandText = "";
			if (BotCommands[command].desc) {
				commandText += BotCommands[command].desc;
			}
			commandText += "\n";
			attachment.pretext = preText;
			attachment.text = commandText;
			attachments.push(attachment);
		}
		respond({text: response, attachments: attachments})
	};

	function parse (argv) {
		argv = argv.length?argv:["help"];
		return {
			verb: argv[0],
			args: argvParser(argv.splice(1), {})
		};
	};


	function exec (user, argv, channel, respond) {
		var command = parse(argv);
		command.user = user;
		command.respond = respond;
		command.channel = channel
		if (BotCommands[command.verb] && BotCommands[command.verb].exec) {
			BotCommands[command.verb].exec(command)
		}
		else {
			help(respond);
		}
	};


};
