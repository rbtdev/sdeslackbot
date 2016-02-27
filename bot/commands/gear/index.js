var GearController = require('../../../controllers/gear.js');
var moment = require('moment');

var actions = ["need", "have", "list", "del"];
var levels =  ["l1", "l2", "l3", "l4", "l5", "l6", "l7", "l8"];
var strengths = ["c", "r", "vr"];
var qualifiers = levels.concat(strengths);
var levelItems = ["bursters", , "cubes", "resos", "ultrastrikes"];
var strengthItems = ["shields", "heatsinks","multihacks", "axas", "linkamps"];
var plainItems = ["mufgs", "capsules", "adas", "jarvis", "ultralinks", "media", "keycaps", "keys"];;
var items = levelItems.concat(strengthItems.concat(plainItems));

var gearHelp = "<list|need|have> [l1-l8 or c,r,vr] <mufgs|capsules|ultralinks|linkamps|bursters|resos|cubes|shields|ultrastrikes|multihacks|heatsinks|axas|adas|jarvis>";

function listResponse(userId, respond) {
	return function (err, results) {

		if (err) return respond({text: "Unable to get a list of gear posts."})
		if (results && results.length == 0) return respond({text: "No active gear posts."});
		var attachments = [];
		var text = ""
		for (var i = 0; i<results.length; i++) {
			var post = results[i];
			var inHours = moment.duration(moment(post.expiresOn).diff(moment())).asHours();
			var expiresIn =    "(expires in " + inHours.toFixed(0) + "h)";
			var matchNames = (post.action=="need")?"Pick up from ":"Donate to ";
			post.matches.forEach(function (match) {
				matchNames = matchNames + "<@" + match.user + "> ";
			})
			var postUser = "You";
			var postAction = post.action;

			if (post.user != userId) {
				postUser = "<@" + post.user + ">";
				postAction = (post.action==="have")?"has":"needs";
			}
			
			var postText = postUser + " " + postAction + " " + (post.qualifier?post.qualifier:"").toUpperCase() + " " + post.item + "\t\t" + expiresIn;
	
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

function postAction(action, qualifier, item, user, respond) {

	gearPost = {
		user: user.id,
		userName: user.name,
		action: action,
		qualifier: qualifier,
		item: item
	};
	return GearController.post(gearPost, postResponse(respond))
};


function deletePost(user, qualifier, item, respond) {
	GearController.delete(user.id, qualifier, item, function (err) {
		if (err) return respond({text: "Cannot find a post for " + qualifier + " " + item})
		return respond({text: "Deleted your post for " + qualifier + " " + item})
	})
}

function gear(command) {

	var user = command.user;
	var args = command.args;
	var respond = command.respond;

	var request = args._;
	if (request.length < 1) return respond({text: "Usage: " + gearHelp});
	var fullAction = getFullAction(request);
	if (!fullAction.err) {
		switch (fullAction.action) {
			case "list":
				var userId = (request[1] === "all")?null:user.id
				console.log("Listing for " + userId)
				return GearController.list(userId, listResponse(user.id, respond));
			break;
			case "need":
			case "have":
				return postAction(fullAction.action, fullAction.qualifier, fullAction.item, user, respond);
			break;
			case "del":
				return deletePost(user, fullAction.qualifier, fullAction.item, respond); 
			default:
				return respond({text: "need valid action: " + actions});
			break
		}
	}
	else {
		return respond ({text: fullAction.err});
	}

};

function getFullAction(request) {
	var fullAction = null;
	var action = request[0];
	var qualifier = request[2]?request[1]:null;
	var item = qualifier?request[2]:request[1];

	if (action && (actions.indexOf(action) < 0)) {
		return ({err: "Need valid action: " + actions});
	}
	if (action == "need" || action == "have" || action == "del") {
		if (qualifier && (qualifiers.indexOf(qualifier) < 0)) {
			return ({err: "Need valid level or strength: " + qualifiers});
		}
		if (!item || (items.indexOf(item) < 0)) {
			return ({err: "Need valid item: " + items});
		}
		qualifier = qualifier?qualifier:"";
		var strengthItemValid = ((strengthItems.indexOf(item) >= 0) & ((!qualifier) || (strengths.indexOf(qualifier) >= 0)));
		var levelItemValid = ((levelItems.indexOf(item) >= 0) & ((!qualifier) || (levels.indexOf(qualifier) >= 0)));
		var plainItemValid = ((plainItems.indexOf(item) >= 0) & (!qualifier));

		if (strengthItemValid || levelItemValid || plainItemValid) {
			return ({
				err: null,
				action: action,
				qualifier: qualifier,
				item: item
			})
		}
		return ({err: "No such thing as a " + qualifier + " " + item});
	}
	else {
		return ({
			err: null,
			action: action,
			qualifier: qualifier,
			item: item
		})

	}

}
	



var desc = 
"Post a gear request or availability into the Gear Exchange.  Posts expire " +
"after 24 hours if no matching post has been submitted.  If someone submits a " +
"post which satisfies your 'need' or 'have' you will both be notified via a " +
"message sent to your Slackbot channel";

module.exports = {
	exec: gear,
	usage: gearHelp,
	desc: desc
}