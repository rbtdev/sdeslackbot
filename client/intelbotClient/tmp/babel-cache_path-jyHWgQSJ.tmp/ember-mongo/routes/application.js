import Ember from 'ember';
import ApplicationRouteMixin from 'simple-auth/mixins/application-route-mixin';

export default Ember.Route.extend(ApplicationRouteMixin, {
	actions: {
		logout: function logout() {
			this.get('session').invalidate();
		},
		login: function login() {
			this.transitionTo('login');
		}
	}
});