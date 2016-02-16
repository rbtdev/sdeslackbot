import Ember from 'ember';

export default Ember.Controller.extend({
	actions: {
	    signup: function() {
	    	var _this = this;
	    	var flashQueue = Ember.get(this, 'flashMessages');
			var user = this.store.createRecord('user', {
				email: this.get('email'),
				password: this.get('password'),
				name: this.get('name'),
				avatar: this.get('avatar')
			});
			user.save().then (function () {
				_this.transitionToRoute('success');
			},
			function () {
				flashQueue.alert('Unable to create user');
			});
		}
	}
});