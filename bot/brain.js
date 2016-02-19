var data = require('../models/data');
var str2argv = require('string-argv');
var argvParser = require('minimist');
var Messenger = require('./messenger');

module.exports = function Brain() {
	this.exec = exec;
	var messenger = new Messenger();

	function Attachment (link) {
		this.fallback = link.name;
		this.text =  "<"+ link.intelUrl + "|Intel Map>" + "   <" + link.mapsUrl + "|Google Map>";
		this.title = link.name + " - " + link.area + " (" + link.shortCode + ")";
	};

	function  makeAttachments (links) {
		var attachments = [];
		if (links) {
			for (var i=0; i<links.length; i++) {
				attachments.push(new Attachment(links[i]));
			}
		}
		return attachments;
	};

	function list (args, respond) {
		var response = "List of available locations:";
		data.find(null, function (links) {
			var attachments = makeAttachments(links);
			respond({text: response, attachments: attachments});
		});
	};

	function add (args, respond) {
		var response = "Coming soon...";
		var attachments = [];
		respond({text: response, attachments: attachments});
	};

	function find (args, respond) {
		var response = "Area not found";
		var searchText = args._.join(' ');
		data.find(searchText, function (links) {
			var attachments = makeAttachments(links);
			if (attachments.length > 0) {
				response = "Results with '" + searchText + "'";
			}
			respond({text: response, attachments: attachments});
		});
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
			verb: argv[0],
			args: argvParser(argv.splice(1), {})
		};
	};

	function exec (hook, channel, respond) {
		console.log("hook = " + JSON.stringify(hook))
		//data.load("https://docs.google.com/spreadsheets/d/1GI580TI29HL05Omegqb-HqHczU9sAY5XAgY9G-h9Eqs/pubhtml")
		var command = parse(hook);
		switch (command.verb.toLowerCase()) {
			case "list":
				list(command.args, respond);
			break;
			case "add":
				response = add(command.args);
			break;
			case "find":
				find(command.args, respond);
			break;
			case "motd":
				motd(hook, command.args, channel, respond);
			break;
			default:
				help(command.args, respond);
			break;
		}
	};


};
