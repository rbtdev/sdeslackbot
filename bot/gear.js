var GearController = require('../controllers/gear.js');
var moment = require('moment');

function listResponse(respond) {
	return function (err, results) {
		if (err) return respond({text: "Unable to get a list of your gear posts."})
		if (results && results.length == 0) return respond({text: "You have no active gear posts."});
		var attachments = [];
		var text = ""
		for (var i = 0; i<results.length; i++) {
			var post = results[i];
			var inHours = moment.duration(moment(post.expiresOn).diff(moment())).asHours();
			var expiresIn =    "(expires in " + inHours.toFixed(0) + "h)";
			var matchNames = (post.action=="need")?"Pick up from ":"Donate to ";
			JSON.stringify(post);
			post.matches.forEach(function (match) {
				console.log("match user = " + match.user)
				matchNames = matchNames + "<@" + match.user + "> ";
			})
			var postText = "You " + post.action + " " + (post.qualifier?post.qualifier:"").toUpperCase() + " " + post.item + "\t\t" + expiresIn;
	
			var attachment = {
				title: postText,
				text: post.matches.length?matchNames:"",
				fallback: "",
				fields: null,
				color: (post.action=='need')?'danger':'good',
				mrkdwn_in: ["text"]
			}
			attachments.push(attachment);		
		}
		respond({text: text, attachments:attachments})
	}
};

function postResponse (respond) {
	return function (err, post) {
		if (err) {
			var response = "Unable to save your request. Please try again later (EC" + err.code + ").";
			console.log(JSON.stringify(err));
			if (err.code == 11000) { // Duplicate
				response = "You've already told me that. You'll be notified when a match occurs.";
			} else {
				response = "You can't 'need' and 'have' the same item.";
			}
			return respond({text: response});
		} 
		if (post.action == "need") {
			respond({text: "Your gear needs have been submitted. You'll receive a message in your Slackbot channel when someone has what you need. Gear exchange requests expire in 24 hours."})
		}
		else if (post.action == "have") {
			return respond({text: "Your gear availability has been submitted. You'll receive a message in your Slackbot channel when someone needs what you have. Gear exchange requests expire in 24 hours."})
		}
		else return respond({text: "Thank you for using the Intel Gear Exchange"})
	}
};

function gear(user, args, respond) {
	var gearHelp = "usage: @intel gear <need|have> [l1-l8 or r,vr] <bursters|resos|cubes|shields|ultrastrikes|multihacks|heatsinks|axas|adas|jarvis>";
	var actions = ["need", "have", "got", "gave", "list"];
	var levels =  ["l1", "l2", "l3", "l4", "l5", "l6", "l7", "l8"];
	var strengths = ["r", "vr"];
	var qualifiers = levels.concat(strengths);
	var levelItems = ["bursters", , "cubes", "resos", "ultrastrikes"];
	var strengthItems = ["shields", "heatsinks","multihacks", "axas", "amps"];
	var plainItems = ["adas", "jarvis"];
	var easterEggs = ["girls", "money"];
	var items = levelItems.concat(strengthItems.concat(plainItems).concat(easterEggs));

	var request = args._;
	if (request.length < 1) return respond({text: gearHelp});

	var action = request[0];
	if (actions.indexOf(action) < 0) return respond({text: "need valid action (need or have)"});

	if (action == "list") {
		return GearController.list(user.id, listResponse(respond));
	}

	if (request.length < 2) return respond({text: "need qualifer or item"});

	var qualifier = request[1];
	var itemPos;
	if (qualifiers.indexOf(qualifier) < 0) {
		qualifier = "";
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
			userName: user.name,
			action: action,
			qualifier: qualifier,
			item: item
		};
		return GearController.post(gearPost, postResponse(respond))
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

module.exports = gear;