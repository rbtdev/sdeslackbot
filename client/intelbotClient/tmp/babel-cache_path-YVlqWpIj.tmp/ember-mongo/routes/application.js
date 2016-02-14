import Ember from 'ember';

export default Ember.Route.extend({
	actions: {
		logout: function logout() {
			this.get('session').invalidate();
			this.transitionTo('login');
		},
		login: function login() {
			this.transitionTo('login');
		}
	}
});