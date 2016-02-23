
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

module.exports = {
	makeAttachments: makeAttachments
}