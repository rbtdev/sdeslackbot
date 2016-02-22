var json2csv = require('json2csv');
var loadCsv = require('../models/data.js').loadCsv;
var mongoose = require('mongoose');
var async = require('async');

function use (controller) {
	var apiController = new ApiController(controller);
	return apiController;
}

function ApiController(controller) {
	this.model = controller.model;
	this.controller = controller;
	this.readAll = api.readAll.bind(this);
	this.updateOne = api.updateOne.bind(this);
	this.create = api.create.bind(this);
	this.delete = api.delete.bind(this);
	this.download = api.download.bind(this);
	this.updateBulk = api.updateBulk.bind(this);
}

var api = {
	readAll: function (req, res, next) {
		var _this = this;
		this.model
			.find()
		    .exec( function (err, docs) {
				if (err) return	res.status(500).send(err);
				var result = {}
				result[_this.model.modelName] = docs;
				res.status(200).send(result);
		    });
	},

	updateOne:  function (req, res, next) {
		var _this = this;
		this.model
			.findById(req.params.id)
			.exec( function (err, item) {
				if (err) return res.status(500).send(err);
				if (!item) return res.status(404).send({});

				var newItem = req.body[_this.model.modelName];
				for (var field in newItem) {
					item[field] = newItem[field];
				}
			    item.save(function (err) {
			    	if (err) return res.status(500).send(err);
					res.status(200).send({item:item});
				})
		  	});
	},

	create: function (req, res, next) {
		var _this = this;
		var source = req.body[this.model.modelName];
		source.user = req.user;
		source.method = "manual";
		var item = new this.model(source);
		item.save(function (err) {
			if (err) return res.status(500).send({error:err, item:item});
			var result = {};
			result[_this.model.modelName] = item;
			res.status(200).send(result);
		});
	},

	delete: function (req, res, next) {
		this.model
			.findById(req.params.id)
			.exec(function (err, item) {
				if (err) return res.status(500).send(err);
				if (!item) return res.status(404).send({});
				item.remove(function (err) {
					if (err) return res.status(500).send(err);
			        res.status(200).send({});
			    });
			});
	},

	download: function (req, res, next) {
		var _this = this;
		this.model
			.find()
			.exec(function (err, docs) {
				if (err) return res.status(500).send(err);
				if (!docs) return res.status(404).send({});
				var fields = _this.controller.exportFields;
				json2csv({ data: docs, fields: fields }, function(err, csv) {
			    	if (err) return res.status(500).send(err);
					res.attachment(_this.controller.exportFileName);
					res.end(csv);
				});
			})
	},

	updateBulk: function (req, res, next) {
		var _this = this;
		var stats = {
			saveCount:0,
			newCount:0,
			existingCount: 0,
			errorCount: 0,
		};

		var user = req.user;
		var errorItems = [];

		function update (user) {
			return function save(item, cb) {
				var importKey = _this.controller.importKey
				console.log("Finding item with " + importKey + " = " + item[importKey])
				var query = {};
				query[importKey] = item[importKey];
				_this.model.findOne(query, function (err, doc) {
					if (err) {
						stats.errorCount++
						errorItems.push(item);
						return cb() // ignore error for individual items
					}
					else {
						if (doc) {
							for (var i=0; i < _this.controller.importFields.length; i++) {
								var field = _this.controller.importFields[i];
								doc[field] = item[field];
							}
							stats.existingCount++
						}
						else {
							// new doc
							doc = new _this.model(item);
							stats.newCount++;
						}
						doc.user = user;
						doc.method = 'upload';
						doc.save(function (err, newDoc) {
							if (err) {
								stats.errorCount++;
								errorItems.push(doc);
								return cb() // ignore error for individual items
							}
							else {
								stats.saveCount++;
								return cb();
							}
						})
					}
				})
			}
		};

		// async update each item in the imported file;
		var docs = req.body[_this.controller.collectionName];
		async.each(docs, update(user), function (err) {
			if (err) {
				res.status(500).send(err);
			}
			else {
				_this.model
					.find()
					.exec(function (err, results) {
						if (err) return res.status(500).send(err);
						var result = {};
						result[_this.model.modelName] = results;
						result.stats = stats;
						result.errorItems = errorItems;
						res.status(200).send(result);
					});
			};				
		})
	},
};

module.exports = use;

