import Ember from 'ember';
import AuthenticatedRouteMixin from 'simple-auth/mixins/authenticated-route-mixin';
import InfiniteScrollRouteMixin from 'ember-cli-infinite-scroll/mixins/infinite-scroll-route';

export default Ember.Route.extend(InfiniteScrollRouteMixin, AuthenticatedRouteMixin, {
  infiniteIncrementProperty: 'start',
  infiniteIncrementBy: 'limit',
  limit: 5,
  start: 0,
  model: function model() {
    return this.infiniteQuery('note');
  },

  actions: {
    reload: function reload() {
      this.refresh();
    }
  }
});