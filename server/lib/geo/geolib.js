function toRadians (deg) {
	return 2*Math.PI*deg/360.0;
}

function geoFromUrl(url) {
    var geo = null;
    var params = url.split("pll=")
    if (params.length >=2) {
      var llStr = params[1];
      var ll = llStr.split(',');
      var lat = parseFloat(ll[0]);
      var lng = parseFloat(ll[1]);
      geo = (!isNaN(lat) && !isNaN(lng))?[lat,lng]:null;
    }
	return geo;
}

function distance (loc1, loc2) {
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

module.exports = {
	distance: distance,
	geoFromUrl: geoFromUrl
}
