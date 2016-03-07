var slackUtils = require('../../utils.js');
var LocationModel = require("../../../models/location.js");

function find (command) {
	var args = command.args;
	var respond = command.respond;
	var response = "Area not found";
	var searchText = args?args._.join(' '):null;
	if (searchText) {
    	searchText = '\"' + searchText + '\"';
  	}
	LocationModel
	.find()
	.where(searchText?{'$text':{'$search':searchText}}:{})
	.where('method').ne('outgress')
    .sort('name')
    .exec(function (err, links) {
    	if (err) return respond({text: "DB error."});
    	if ((!links) || (links.length == 0)) return respond({text: "No portals found."});
		var attachments = slackUtils.makeAttachments(links);
		if (attachments.length > 0) {
			response = "Results with '" + searchText + "'";
		}
		respond({text: response, attachments: attachments});
	});
};

var usage = "<name>";

module.exports = {
	exec: find,
	usage: usage,
	desc: "searches for the portal specified by <name> (<name> can be an area, abbreviaton, or specific portal)"
}