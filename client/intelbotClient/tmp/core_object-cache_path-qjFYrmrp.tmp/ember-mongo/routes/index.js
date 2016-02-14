define('ember-mongo/routes/index', ['exports', 'ember', 'simple-auth/mixins/authenticated-route-mixin', 'ember-cli-infinite-scroll/mixins/infinite-scroll-route'], function (exports, Ember, AuthenticatedRouteMixin, InfiniteScrollRouteMixin) {

  'use strict';

  exports['default'] = Ember['default'].Route.extend(InfiniteScrollRouteMixin['default'], AuthenticatedRouteMixin['default'], {
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

});