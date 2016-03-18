const Re = 6371008; // Earth Mean Radius (meters)

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
      geo = (!isNaN(lat) && !isNaN(lng))?[lng,lat]:null;
    }
	return geo;
}

function haversine (loc1, loc2) {
	var l1 = toRadians(loc1.lat());
	var l2 = toRadians(loc2.lat());
	var dr = toRadians(loc2.lat()-loc1.lat());
	var dl = toRadians(loc2.lng()-loc1.lng());
	var a = Math.sin(dr/2) * Math.sin(dr/2) +
	        Math.cos(l1) * Math.cos(l2) *
	        Math.sin(dl/2) * Math.sin(dl/2);
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
	var distance =  (Re * c);    

    return distance;
}

module.exports = {
	distance: haversine,
	geoFromUrl: geoFromUrl
}
