var Gear = require('../models/gear.js');
var User = require('../models/user.js');



function findMatches(post) {
	var matchAction = (post.action=="need")?"have":"need";

	Gear.find({action: matchAction, qualifier: post.qualifier, item: post.item}, function (err, matchDocs) {
		if (err) return cb(err);
		if (matchDocs.length == 0) return; // Post submitted, no matching haves doc
		// found matches, send a SlackBot message to the matching users
		var qualifier = post.qualifier?post.qualifier:"";
		var item = post.item?post.item:"";
		for (var i = 0; i < matchDocs.length; i++ ) {
			var matchDoc = matchDocs[i];
			var postUser = bot.slack.getUserByID(post.user);
			var matchUser = bot.slack.getUserByID(matchDoc.user);
			if (!(postUser && matchUser)) return
			var itemText = qualifier + " " + item;
			var matchText = "I found a gear exchange match!";
			var postUserText = "<@" + post.user + ">";
			var matchUserText = "<@" + matchDoc.user + ">";
			var postResultText = (post.action=="need")?"has what you need.":"needs what you have.";
			var matchResultText = (post.action=="need")?"needs what you have.":"has what you need.";

			bot.sendDM(postUser, matchText + " " + matchUserText + " " + postResultText + " - " + itemText)
			bot.sendDM(matchUser, matchText + " " + postUserText + " " + matchResultText + " - " + itemText);
			
			// update both records with match info
			matchDoc.matches.push(post._id);
			post.matches.push(matchDoc._id);
			matchDoc.save(function (err, doc) {
				console.log("Saved match info for matching doc")
			})
			post.save(function (err, doc) {
				console.log("Saved match info for post doc");
			})
		}
	})
}

var controller = {

	post: function (postData, cb) {
		var gearPost = new Gear(postData);
		gearPost.save(function (err, doc) {
			if (err) return cb(err, doc);
			// Check for matching requests
			findMatches(doc);
			return cb(null, doc);
		});
	},

	list: function (query, cb) {
		Gear
			.find(query)
			.populate('matches')
			.exec(function (err, docs) {
				if (err) return cb(err);
				return cb(null, docs);
			})
	},

	delete: function (slackUserId, qualifier, item, cb) {
		var query = {user:slackUserId, qualifier: qualifier, item:item};
		Gear.findOne(query)
			.exec(function (err, item) {
				if (err) return cb(err);
				if (!item) return cb(new Error("Post not found"));
				item.remove(function (err) {
					if (err) return cb(err);
			        cb();
			    });
			});
	}
}

module.exports = controller;