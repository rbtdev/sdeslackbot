var LocationModel = require('../models/location.js').model;
var LocationPreSave = require('../models/location.js').preSave;
var UserModel = require('../models/user.js');
var ObjectId = require('mongoose').Types.ObjectId; 
var json2csv = require('json2csv');
var loadCsv = require('../models/data.js').loadCsv;
var mongoose = require('mongoose');
var async = require('async');

var controller = {

	readAll: function (req, res, next) {

		//var owned = {author: ObjectId(req.user)}
		LocationModel
			.find()
		    .exec( function (err, locations) {
				if (err) {
					res.status(500).send(err);
				}
				else {
					var result = { 
							location:locations
						}
					res.status(200).send(result);
				}
		    });
	},

	update:  function (req, res, next) {
		LocationModel
			.findById(req.params.id)
			.exec(function (err, location) {
			    location.name = req.body.location.name;
			    location.area = req.body.location.area;
			    location.intelUrl = req.body.location.intelUrl;
			    location.mapsUrl = req.body.location.mapsUrl;
			    location.shortCode = req.body.location.shortCode;
			    return location.save(function (err) {
			      if (!err) {
			      	res.status(200).send({location:location});
			      } else {
			        res.status(404).send(err);
			      }
			    });
		  	});
	},

	create: function (req, res, next) {
		var location = new LocationModel({
			    name: req.body.location.name,
			    area: req.body.location.area,
			    intelUrl: req.body.location.intelUrl,
			    mapsUrl: req.body.mapsUrl,
			    shortCode: req.body.shortCode,
				author: req.user.id
			});
		location.save(function (err) {
			if (!err) {
			  res.status(200).send({location:location});
			} else {
			  res.status(500).send({error:err, location:location});
			}
		});
	},

	delete: function (req, res, next) {
		LocationModel
			.findById(req.params.id)
			.exec(function (err, location) {
				if (err) throw (err);
			    return location.remove(function (err) {
			      if (!err) {
			        res.status(200).send({});
			      } else {
			        res.status(500).send(err);
			      };
			    });
			});
	},

	download: function (req, res, next) {
		LocationModel
			.find()
			.exec(function (err, locations) {
				if (!err) {
					var fields = ['name', 'area', 'intelUrl', 'mapsUrl', 'shortCode', 'lat', 'lng']
					json2csv({ data: locations, fields: fields }, function(err, csv) {
				    	if (!err) {
							res.attachment('portals.csv');
							res.end(csv);
						}
						else {
							res.status(500).send("Error converting CSV")
						}
  					});
				}
				else {
					res.status(500).send("Error getting locations")
				}
			})
	},

	replace: function (req, res, next) {
		var saveCount = 0;

		function save(location, cb) {
			console.log("Creating new location: " + location.name);
			var locationObj = new LocationModel(location);
			console.log("Executing save for location: " + locationObj.name);
			locationObj.save(function (err) {
				if (err) {
					// ignore errors on individual objects for now
					console.log("Location Obj rejected: " + locationObj.name);
					return cb();
				}
				else {
					console.log("Location Obj saved: " + locationObj.name)
					saveCount++
					return cb();
				}
			})
		};

		console.log("Dropping collection..");
		mongoose.connection.db.dropCollection('locations', function(err, result) {
			console.log("Async save starting.");
			var locations = req.body.locations;
			console.log("Location list: " + JSON.stringify(locations))
			async.each(locations, save, function (err) {
				if (err) {
					res.status(500).send(err);
				}
				else {
					console.log("Async save complete. Saved " + saveCount + " items. Fetching new collection.");
					LocationModel
					.find()
					.exec(function (err, results) {
						if (err) {
							res.status(500).send(err);
						}
						else {
							res.status(200).send({location:results.ops});
					    }
					});
				};				
			})
		})
		
	},
};

module.exports = controller;

