import Ember from 'ember';

export default Ember.Controller.extend({

	currentNote: null,
	newTitle: null,
	actions: {

		edit: function edit(note) {
			this.send('cancel', this.get('currentNote'));
			note.set('isEditing', true);
			this.set('currentNote', note);
		},
		save: function save() {
			var flashQueue = Ember.get(this, 'flashMessages');
			var note = this.get('currentNote');
			var _this = this;
			note.save().then(function (note) {
				//_this.send('reload');
			}, function () {
				flashQueue.alert('Unable to save note');
			});
			note.set('isEditing', false);
			this.set('currentNote', null);
		},
		add: function add() {
			var note = this.store.createRecord('note', {
				title: this.get('newTitle'),
				content: "",
				author: "",
				isEditing: false
			});
			this.set('newTitle', null);
			this.set('currentNote', note);
			this.send('save');
		},
		'delete': function _delete(note) {
			var _this = this;
			note.destroyRecord().then(function () {
				//_this.send('reload');
			});
		},

		cancel: function cancel(note) {
			if (note) {
				note.set('isEditing', false);
				note.rollback();
			}
		},

		receiveFile: function receiveFile() {
			debugger;
		}
	}
});