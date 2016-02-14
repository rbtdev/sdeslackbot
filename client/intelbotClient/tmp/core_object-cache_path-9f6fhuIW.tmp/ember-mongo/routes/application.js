define('ember-mongo/routes/application', ['exports', 'ember', 'simple-auth/mixins/application-route-mixin'], function (exports, Ember, ApplicationRouteMixin) {

	'use strict';

	exports['default'] = Ember['default'].Route.extend(ApplicationRouteMixin['default'], {
		actions: {
			logout: function logout() {
				this.get('session').invalidate();
			},
			login: function login() {
				this.transitionTo('login');
			}
		}
	});

});