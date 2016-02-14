var mongoose = require('mongoose');
var acl = require('mongoose-acl');

var noteSchema = new mongoose.Schema({
	title: 'string',
	content: 'string',
	author: { type: mongoose.Schema.ObjectId, ref: 'user' }
});

noteSchema.plugin(acl.object);

var NoteModel = mongoose.model('note',noteSchema);
module.exports = NoteModel;