var LocationModel = require('../models/location.js');
var UserModel = require('../models/user.js');
var ObjectId = require('mongoose').Types.ObjectId; 
var json2csv = require('json2csv');

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
					var fields = ['name', 'area', 'intelUrl', 'mapsUrl', 'shortCode']
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
	}
};

module.exports = controller;

