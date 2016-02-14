import Ember from 'ember';

export default Ember.Controller.extend({

	actions: {
		edit: function edit(note) {
			note.set('isEditing', true);
		},
		save: function save(note) {
			note.save();
			note.set('isEditing', false);
		},
		add: function add() {
			this.store.createRecord('note', {
				title: "",
				content: "",
				author: "",
				isEditing: true
			});
		},
		'delete': function _delete(note) {
			note.destroyRecord();
		},

		cancel: function cancel(note) {
			note.set('isEditing', false);
			note.rollback();
		}
	}
});