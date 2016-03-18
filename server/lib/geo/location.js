var Lib = require('./geolib.js');

function Location() {
	this.geo = null;

	if ((arguments.length == 1) && (isNaN(arguments[0]) && (arguments[0].indexOf("pll=") >= 0))) {
		// ingress url lat/lng
		this.geo = Lib.geoFromUrl(arguments[0]);
	}
	else if ((arguments.length == 2) && (!isNaN(arguments[0]) && !isNaN(arguments[1]))) {
		// lat,lng arguments
		var lat = arguments[0];
		var lng = arguments[1];
		this.geo = [lng, lat]; // complies with Mongoose Geospatial index format
	} 
}

Location.prototype.distanceTo = function (location) {
	return Lib.distance(this, location);
}

Location.prototype.lat = function () {
	return this.geo[1];
}

Location.prototype.lng = function () {
	return this.geo[0];
}

module.exports = Location;

