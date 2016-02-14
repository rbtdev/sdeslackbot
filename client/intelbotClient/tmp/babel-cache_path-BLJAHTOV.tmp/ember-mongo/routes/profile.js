import Ember from 'ember';
import AuthenticatedRouteMixin from 'simple-auth/mixins/authenticated-route-mixin';
export default Ember.Route.extend(AuthenticatedRouteMixin, {
	model: function model() {
		return this.store.find('user', this.get('session.secure.user._id'));
		l;
	}
});