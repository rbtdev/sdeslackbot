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
	this.update = api.update.bind(this);
	this.create = api.create.bind(this);
	this.delete = api.delete.bind(this);
	this.download = api.download.bind(this);
	this.replace = api.replace.bind(this);
}

var api = {
	readAll: function (req, res, next) {
		var _this = this;
		this.model
			.find()
		    .exec( function (err, docs) {
				if (err) {
					res.status(500).send(err);
				}
				else {
					var result = {}
					result[_this.model.modelName] = docs;
					res.status(200).send(result);
				}
		    });
	},

	update:  function (req, res, next) {
		var _this = this;
		this.model
			.findById(req.params.id)
			.exec(
				function (err, item) {
					_this.model.update(item, req.body.item);
				    return item.save(function (err) {
				      if (!err) {
				      	res.status(200).send({item:item});
				      } else {
				        res.status(404).send(err);
				      }
			    });
		  	});
	},

	create: function (req, res, next) {
		var source = req.body[this.model.modelName];
		var item = new this.model(source);
		item.save(function (err) {
			if (!err) {
			  res.status(200).send({item:item});
			} else {
			  res.status(500).send({error:err, item:item});
			}
		});
	},

	delete: function (req, res, next) {
		this.model
			.findById(req.params.id)
			.exec(function (err, item) {
				if (err) throw (err);
				if (item) {
				    item.remove(function (err) {
				      if (!err) {
				        res.status(200).send({});
				      } else {
				        res.status(500).send(err);
				      };
				    });
				}
				else {
					res.status(404).send({});
				}
			});
	},

	download: function (req, res, next) {
		var _this = this;
		this.model
			.find()
			.exec(function (err, docs) {
				if (!err) {
					var fields = _this.controller.exportFields;
					json2csv({ data: docs, fields: fields }, function(err, csv) {
				    	if (!err) {
							res.attachment(_this.controller.exportFileName);
							res.end(csv);
						}
						else {
							res.status(500).send("Error converting CSV")
						}
  					});
				}
				else {
					res.status(500).send("Error getting docs")
				}
			})
	},

	replace: function (req, res, next) {
		var _this = this;
		var saveCount = 0;

		function save(item, cb) {
			var itemObj = new _this.model(item);
			itemObj.save(function (err) {
				if (err) {
					// ignore errors on individual objects for now
					return cb();
				}
				else {
					saveCount++
					return cb();
				}
			})
		};

		mongoose.connection.db.dropCollection(this.controller.collectionName, function(err, result) {
			var docs = req.body[_this.controller.collectionName];
			async.each(docs, save, function (err) {
				if (err) {
					res.status(500).send(err);
				}
				else {
					_this.model.
					ensureIndexes(
					function (err) {
						if (err) {
							res.status.send(err);
						}
						else {
							_this.model
							.find()
							.exec(function (err, results) {
								if (err) {
									res.status(500).send(err);
								}
								else {
									res.status(200).send({item:results.ops});
							    }
							});						
						}
					});
				};				
			})
		})
		
	},
};

module.exports = use;

