function toRadians(deg) {
	return 2*Math.PI*deg/360.0;
}

function distance(loc1, loc2) {
	var d = null;
	const R = 6371000; // metres

	var l1 = toRadians(loc1[0]);
	var l2 = toRadians(loc2[0]);
	var dr = toRadians(loc2[0]-loc1[0]);
	var dl = toRadians(loc2[1]-loc1[1]);

	var a = Math.sin(dr/2) * Math.sin(dr/2) +
	        Math.cos(l1) * Math.cos(l2) *
	        Math.sin(dl/2) * Math.sin(dl/2);
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

	d = R * c;    
    return d;
}

function Location() {
	function ll(url) {
	    var result = null;
	    var params = url.split("pll=")
	    if (params.length >=2) {
	      var llStr = params[1];
	      var ll = llStr.split(',');
	      result = {};
	      result.lat = parseFloat(ll[0]);
	      result.lng = parseFloat(ll[1]);
	    }
		return result;
	}

	this.geo = null;

	if ((arguments.length == 1) && (isNaN(arguments[0]) && (arguments[0].indexOf("pll=") >= 0))) {
		// ingress url lat/lng
		var location = ll(arguments[0]);
		if (location) {
			this.geo = [location.lat, location.lng];
		}
	}
	else if ((arguments.length == 2) && (!isNaN(arguments[0]) && !isNaN(arguments[1]))) {
		// lat,lng arguments
		console.log("lat/lng " + arguments[0] + "," + arguments[1])
		this.geo = [arguments[0], arguments[1]]
	}

	this.distanceTo = function (location) {
		return distance(this.geo, location.geo);
	}
}

var geo = {
	Location: Location,

}

module.exports = geo;