import Ember from 'ember';
import AuthenticatedRouteMixin from 'simple-auth/mixins/authenticated-route-mixin';
import InfiniteScrollRouteMixin from 'ember-cli-infinite-scroll/mixins/infinite-scroll-route';

export default Ember.Route.extend(AuthenticatedRouteMixin, {
	infiniteIncrementProperty: 'start',
	infiniteIncrementBy: 'limit',
	limit: 5,
	start: 0,
  model: function() {
    var model = this.store.find('location');
    return model;

    //return this.infiniteQuery('location');
  },

  actions: {
    reload: function() {
      this.refresh()
    }
  }
});