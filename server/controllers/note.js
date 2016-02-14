var NoteModel = require('../models/note.js');
var UserModel = require('../models/user.js');
var ObjectId = require('mongoose').Types.ObjectId; 

var controller = {
	readAll: function (req, res, next) {

		//var owned = {author: ObjectId(req.user)}

		NoteModel
			.withAccess(req.user, ['read'])
		    .limit(req.paginate.limit)
		    .skip(req.paginate.start)
		    .exec( function (err, notes) {
		        NoteModel
		        	.withAccess(req.user, ['read'])
		        	.count()
		        	.exec(function (err, total) {
						if (err) {
							res.status(500).send(err);
						}
						else {
							var total_pages = req.paginate.limit?Math.ceil(total/req.paginate.limit): 1;
							var result = { 
									note:notes,
									meta: {
										total: total, 
										total_pages: total_pages
									}
								}
							res.status(200).send(result);
						}
					})
		    });
	},

	update:  function (req, res, next) {
		NoteModel
			.findById(req.params.id)
			.exec(function (err, note) {
			    note.title = req.body.note.title;
			    note.content = req.body.note.content;
			    return note.save(function (err) {
			      if (!err) {
			      	res.status(200).send({note:note});
			      } else {
			        res.status(404).send(err);
			      }
			    });
		  	});
	},

	create: function (req, res, next) {
		var note = new NoteModel({
				title: req.body.note.title,
				content: req.body.note.content,
				author: req.user.id
			});
		req.user.setAccess(note, ['create', 'read', 'update', 'delete'])
		note.save(function (err) {
			if (!err) {
			  res.status(200).send({note:note});
			} else {
			  res.status(500).send({error:err, note:note});
			}
		});
	},

	delete: function (req, res, next) {
		NoteModel
			.findById(req.params.id)
			.exec(function (err, note) {
				if (err) throw (err);
			    return note.remove(function (err) {
			      if (!err) {
			        res.status(200).send({});
			      } else {
			        res.status(500).send(err);
			      };
			    });
			});
	}
};

module.exports = controller;

