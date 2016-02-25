var slackUtils = require('../../utils.js');
var data = require("../../../models/data.js");

function find (command) {
	var args = command.args;
	var respond = command.respond;

	var response = "Area not found";
	var searchText = args?args._.join(' '):null;
	data.find(searchText, function (links) {
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