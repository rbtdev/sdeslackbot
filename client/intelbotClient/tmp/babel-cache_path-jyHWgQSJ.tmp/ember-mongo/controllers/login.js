import Ember from 'ember';

export default Ember.Controller.extend({
	authError: false,
	actions: {
		authenticate: function authenticate() {
			var _this = this;
			var flashQueue = Ember.get(this, 'flashMessages');
			var credentials = this.getProperties('identification', 'password');
			var authenticator = 'simple-auth-authenticator:token';

			this.get('session').authenticate(authenticator, credentials).then(function () {
				_this.set('identification', null);
				_this.set('password', null);
				_this.set('authError', false);
				_this.transitionToRoute('index');
			}, function () {
				flashQueue.alert('Unable to login');
			});
		}
	}
});