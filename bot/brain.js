var data = require('../models/data');
var str2argv = require('string-argv');
var argvParser = require('minimist');
var Messenger = require('./messenger');
var GearController = require('../controllers/gear.js');

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
		var response = "Visit the <https://intelbot.herokuapp.com|Intel Bot Web Potal> to add portals";
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
			verb: argv[0].toLowerCase(),
			args: argvParser(argv.splice(1), {})
		};
	};

	function gear(user, args, channel, respond) {
		var gearHelp = "usage: @intel gear ...";
		var actions = ["need", "have", "got", "gave", "list"];
		var levels =  ["l1", "l2", "l3", "l4", "l5", "l6", "l7", "l8"];
		var strengths = ["r", "vr"];
		var qualifiers = levels.concat(strengths);
		var levelItems = ["bursters", , "cubes", "resos"];
		var strengthItems = ["shields", "heatsinks","multihacks", "axas", "amps"];
		var plainItems = ["adas", "jarvis"];
		var easterEggs = ["girls", "money"];
		var items = levelItems.concat(strengthItems.concat(plainItems).concat(easterEggs));

		var request = args._;
		if (request.length < 1) return respond({text: "need action qualifier and item"});
		var action = request[0];
		if (actions.indexOf(action) < 0) return respond({text: "need valid action"});

		if (action == "list") {
			return GearController.list(user.id, function (err, results) {
				if (err) return respond({text: "Unable to get a list of your gear posts."})
				if (!results) return respond({text: "You have no active gear posts."});
				var attachments = [];
				var text = "You have the following gear posts:"
				for (var i = 0; i<results.length; i++) {
					var post = results[i];
					var fields = [
			                {
			                    title: post.action + " " + (post.qualifier?post.qualifier:"") + " " + post.item,
			                    short: true
			                }      
            			];
					var attachment = {
						title: "",
						text: "",
						fallback: "",
						fields: fields,
						mrkdwn_in: ["text"]
					}
					attachments.push(attachment);		
				}
				respond({text: text, attachments:attachments})
			});
		}
	
		if (request.length < 2) return respond({text: "need qualifer/item"});
		var qualifier = request[1];
		var itemPos;
		if (qualifiers.indexOf(qualifier) < 0) {
			qualifier = null;
			itemPos = 1;
		}
		else {
			itemPos = 2;
			if (request.length < 3) return respond({text: gearHelp})
		}
		var item = request[itemPos]
		if (items.indexOf(item) < 0) return respond({text: gearHelp});

		var gearPost = null;
		var strengthItemValid = ((strengthItems.indexOf(item) >= 0) & ((!qualifier) || (strengths.indexOf(qualifier) >= 0)));
		var levelItemValid = ((levelItems.indexOf(item) >= 0) & ((!qualifier) || (levels.indexOf(qualifier) >= 0)));
		var plainItemValid = ((plainItems.indexOf(item) >= 0) & (!qualifier));

		if (strengthItemValid || levelItemValid || plainItemValid) {
			gearPost = {
				user: user.id,
				action: action,
				qualifier: qualifier,
				item: item
			};
			GearController.post(gearPost, function (err, post) {
				if (err) return respond({text: "Unable to submit your request. Try again later."});
				if (post.action == "need") {
					respond({text: "Your gear needs have been submitted. You'll receive a message in your Slackbot channel when your gear needs become available."})
				}
				else if (post.action == "have") {
					return respond({text: "Your gear availability has been submitted. You'll receive a message in your Slackbot channel when someone has what you need."})
				}
				else return respond({text: "Thank you for using the Intel Gear Exchange"})
			});
		}
		else if (easterEggs.indexOf(item) >= 0) {
			var response = "";
			if (item == "girls") {
				response = "Well, good luck with that. Maybe less Ingress and more Tinder!";
			} else if (item == "money") {
				response = "Don't we all!"
			}			
			return respond({text: response })
		}
		else {
			var response = "no such thing as " + qualifier + " " + item;
			return respond({text: response })
		}
	};

	function exec (user, hook, channel, respond) {
		console.log("hook = " + JSON.stringify(hook))
		//data.load("https://docs.google.com/spreadsheets/d/1GI580TI29HL05Omegqb-HqHczU9sAY5XAgY9G-h9Eqs/pubhtml")
		var command = parse(hook);
		switch (command.verb) {
			case "list":
				list(command.args, respond);
			break;
			case "add":
				response = add(command.args, respond);
			break;
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
