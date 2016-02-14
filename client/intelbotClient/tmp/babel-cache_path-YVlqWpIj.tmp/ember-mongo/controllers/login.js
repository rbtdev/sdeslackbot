import Ember from 'ember';

export default Ember.Controller.extend({
	authError: false,
	actions: {
		authenticate: function authenticate() {
			var _this = this;
			var credentials = this.getProperties('identification', 'password'),
			    authenticator = 'simple-auth-authenticator:token';

			this.get('session').authenticate(authenticator, credentials).then(function () {
				_this.set('identification', null);
				_this.set('password', null);
				_this.set('authError', false);
				_this.transitionToRoute('index');
			}, function () {
				_this.set('authError', true);
			});
		}
	}
});