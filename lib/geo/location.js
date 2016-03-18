var Lib = require('./geolib.js');

function Location() {
	this.geo = null;

	if ((arguments.length == 1) && (isNaN(arguments[0]) && (arguments[0].indexOf("pll=") >= 0))) {
		// ingress url lat/lng
		this.geo = Lib.geoFromUrl(arguments[0]);
	}
	else if ((arguments.length == 2) && (!isNaN(arguments[0]) && !isNaN(arguments[1]))) {
		// lat,lng arguments
		this.geo = [arguments[0], arguments[1]]
	}
}

Location.prototype.distanceTo = function (location) {
	return Lib.distance(this.geo, location.geo);
}

module.exports = Location;

