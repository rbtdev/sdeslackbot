define('ember-mongo/sessions/custom', ['exports', 'simple-auth/session'], function (exports, Session) {

  'use strict';

  exports['default'] = Session['default'].extend({

    // here _store is ember-data store injected by initializer
    // why "_store"? because "store" is already used by simple-auth as localStorage
    // why initializer? I tried
    // _store: Ember.inject.service('store') and got error

    currentUser: (function () {
      var userId = this.get('secure.userId');
      if (userId && this.get('isAuthenticated')) {
        return this._store.find('user', userId);
      }
    }).property('secure.userId', 'isAuthenticated')

  });

});