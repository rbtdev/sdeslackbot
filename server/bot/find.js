var slackUtils = require('./utils.js');
var data = require("../models/data.js");

function find (args, respond) {

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

module.exports = find;