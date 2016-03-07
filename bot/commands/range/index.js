multiplier = {
  la: 2,
  ula: 5,
  vrla: 7
}

function level(portal) {
  var levels   = portal.split('');
  var total = 0;
  levels.forEach(function (level) {
    total += parseInt(level)
  })
  return Math.floor(total/8);
}


function linkRange(average, linkamps) {
    linkamps.sort(function (a, b) {
      multiplier[b] - multiplier[a]
    })
    baseRange   = 160*Math.pow(average, 4)
    return baseRange*rangeBoost(linkamps);

  function rangeBoost(linkamps) {
    scale = [1.0, 0.25, 0.125, 0.125];
    boost = 0.0;
    count = 0;
    linkamps.forEach(function (mod) {
      if (multiplier[mod]) {
        baseMultiplier = multiplier[mod];
        boost += baseMultiplier*scale[count]
        count++
      }
    })
    if (count > 0) {
      return boost;
    } 
    else {
      return 1.0
    }
  }
}

function metric (range) {
  if (range >= 10000)
    range = Math.round(range/10)/100 + "km"
  else if (range >= 1000)
    range = Math.round(range/10)/100 + "km"
  else
    range = Math.round(range) + "m"
  return range
}

function miles(range) {
  var miles = (range/1000) * 0.621371;
  return miles.toFixed(2) + "mi";
}

function portalCalc(range, maxLevel) {

  var maxRange = linkRange(maxLevel, ["vrla", "vrla", "vrla", "vrla"]);
  if ((range > maxRange) || (range < 0)) {
    return {err: "Range is too far"};
  }
  
  var level = Math.ceil(Math.pow(range/160, 0.25));
  if (level <= maxLevel) {
    return ({
      level: level,
      mods:[]
    })
  }
  var mods = [];
  var results = [];
  var testRange = 0;
  var level = maxLevel;
  while (level >=1 ) {
    do  {
      if (linkRange(level, mods) >= range) {
        return ({
          level:level,
          mods: []
        });
      }
      for (mod in multiplier) {
        for (modSlot = 0; modSlot < 4; modSlot++) {
          mods[modSlot] = mod;  
          testRange = linkRange(level, mods)
          if (testRange >= range) {
            var resultMods = [];
            mods.forEach(function (mod) {
              resultMods.push(mod);
            })
            return ({
              level: level,
              mods: resultMods
            });
          }        
        }

      }
    level--
    } while (testRange < range)
  }
  return results
}

function range (command) {

  var args = command.args._;
  var respond = command.respond;
  if (!args.length) return respond ({text: usage})
  if (!args[0]) return respond ({text: "Need valid portal or range"})

  args[0] = args[0].toString();
  if (args[0].length < 8) {
    var maxLevel = 8;
    if ((args[1]) && (args[1] <= 8)) maxLevel = args[1];
    var result = portalCalc(parseFloat(args[0])*1000, maxLevel);
    if (result.err) return respond ({text: result.err});
    var mods = "";
    result.mods.forEach(function (mod) {
      mods += mod.toUpperCase() + " ";
    })
    var response = "Level " + result.level;
    if (mods.length) response += " with " + mods;
    respond({text: response})
  }

  else {
    if (args[0].indexOf('9') > -1) return respond({text: "Need valid portal"})
    if (args[0].length > 8) return respond({text: "Need a valid portal"})
    var mods = args.splice(1)
    var range = linkRange(level(args[0]), mods);
    respond({text: "Range: " + metric(range) + " (" + miles(range) + ")"})
  }
}

desc = "Find the link range of a portal, or minumum portal needed to link to a given range.";
var help = "<reso_levels> <mods> or range <distance> (in km)"
var usage = "`.range 78877477 vrla vrla la la` - get range of the specified portal" + "\n" +
            "`.range 394` - get portal configuration needed to link 394km"

module.exports = {
  exec: range,
  usage: help,
  desc: desc
}