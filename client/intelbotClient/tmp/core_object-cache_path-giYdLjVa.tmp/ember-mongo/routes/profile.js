define('ember-mongo/routes/profile', ['exports', 'ember', 'simple-auth/mixins/authenticated-route-mixin'], function (exports, Ember, AuthenticatedRouteMixin) {

	'use strict';

	exports['default'] = Ember['default'].Route.extend(AuthenticatedRouteMixin['default'], {
		model: function model() {
			return this.store.find('user', this.get('session.secure.user._id'));
		}
	});

});