import Ember from 'ember';

export default Ember.Controller.extend({
	actions: {
		signup: function signup() {
			var _this = this;
			var flashQueue = Ember.get(this, 'flashMessages');
			var user = this.store.createRecord('user', {
				email: this.get('email'),
				password: this.get('password'),
				name: this.get('name'),
				avatar: this.get('avatar')
			});
			user.save().then(function () {
				var credentials = { identification: _this.get('email'), password: _this.get('password') };
				var authenticator = 'simple-auth-authenticator:token';
				_this.get('session').authenticate(authenticator, credentials).then(function () {
					user = null;
					_this.set('password', null);
					_this.set('email', null);
					_this.transitionToRoute('index');
				}, function () {
					flashQueue.alert('Unable to login');
				});;
			}, function () {
				flashQueue.alert('Unable to create user');
			});
		}
	}
});