import Ember from 'ember';
import ApplicationRouteMixin from 'simple-auth/mixins/application-route-mixin';

export default Ember.Route.extend(ApplicationRouteMixin, {
	actions: {
		logout: function () {
			this.get('session').invalidate();
		},
		login: function () {
			this.transitionTo('login');
		}
	}
});