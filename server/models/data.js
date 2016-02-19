
var Location = require('./location.js').model;

module.exports = {
  find: find
}

function find (searchText, cb) {
  if (searchText) {
    searchText = '\"' + searchText + '\"';
  }
  Location
    .find(searchText?{'$text':{'$search':searchText}}:{})
    .sort('name')
    .exec(function (err, links) {
      err?console.log("DB - find error: " + JSON.stringify(err)):null;
      cb(links?links:[]);
  })
}

// function load (url) {
//   var Tabletop = require('tabletop');

//   Tabletop.init( { key: url,
//                    callback: function(data, tabletop) { console.log(data) },
//                    simpleSheet: true } )
// };

