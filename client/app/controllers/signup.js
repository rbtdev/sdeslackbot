import Ember from 'ember';

export default Ember.Controller.extend({

	email: "",
	password: "",
	verifypw: "",

	hasEmail: Ember.computed.notEmpty('email'),
	hasPassword: Ember.computed.notEmpty('password'),
	pwIsStrong: Ember.computed.match('password', /^(?=.*\d).{4,12}$/),

	pwIsEqual: function () {
		return (this.get('password') === this.get('verifypw'))
	}.property('password', 'verifypw'),

	passwordIsValid: function () {
		return (this.get('hasPassword') && this.get('pwIsEqual') && this.get('pwIsStrong'));
	}.property('hasPassword', 'pwIsEqual'),

	isReady: function () {
		return (this.get('hasEmail') && this.get('passwordIsValid'));
	}.property('hasEmail', 'passwordIsValid'),


	actions: {
	    signup: function() {
	    	if (this.get('isReady')) {
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
	}
});