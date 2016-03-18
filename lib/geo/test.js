var Geo = require('./index.js');

var loc1 = new Geo.Location(33.419505,-117.620146);
var loc2 = new Geo.Location(19.491163,-154.960195);
var distance = loc1.distanceTo(loc2);

console.log('Distance from ' + loc1.geo + " to " + loc2.geo + " = " + distance/1000.0);

var loc1 = new Geo.Location("https://www.ingress.com/intel?ll=27.485766,-114.977805&z=5&pll=33.419505,-117.620146");
var loc2 = new Geo.Location("https://www.ingress.com/intel?ll=22.062128,-136.511008&z=5&pll=19.491163,-154.960195");
var distance = loc1.distanceTo(loc2);

console.log('Distance from ' + loc1.geo + " to " + loc2.geo + " = " + distance/1000.0);