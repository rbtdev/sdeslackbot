var data = require('../models/data');
var str2argv = require('string-argv');
var argvParser = require('minimist');
var gear = require('./gear');
var motd = require('./motd');
var find = require('./find');


module.exports = function Brain() {
	this.exec = exec;

	function help (args, respond) {
		var attachments = [];
		response = "*Welcome to the Ingress Intel Link Bot (beta)*\n\n";
		response += "*The following commands are now available*\n";
		response += "`  @intel find <name> - searches for the location specified by <name>. Ex: @intel find tony romas`\n",
		response += "`  @intel list - dispays a list of available areas`\n";
		response += "`  @intel motd -m 'message to send' -r <repeat interval in mins> -l <location>`\n\n";
		response += "*Coming soon*\n"
		response += "`  @intel add <area> <name> <shortCode> <intelLink> <mapsLink> - adds an area to the list of available areas. Admins only.`\n";
		response += "`  @intel upload <google spreadsheet url> - bulk adds a list of area entries. Admins only`\n"
		respond({text: response, attachments: attachments})
	};

	function parse (hook) {
		var argv = str2argv.parseArgsStringToArgv(hook.text).splice(1);
		argv = argv.length?argv:["help"];
		return {
			verb: argv[0].toLowerCase(),
			args: argvParser(argv.splice(1), {})
		};
	};


	function exec (user, hook, channel, respond) {
		var command = parse(hook);
		switch (command.verb) {
			case "list":
				find(null, respond);
			break;;
			case "find":
				find(command.args, respond);
			break;
			case "motd":
				motd(hook, command.args, channel, respond);
			break;
			case "gear":
				gear(user, command.args, channel, respond);
			break;
			default:
				help(command.args, respond);
			break;
		}
	};


};
