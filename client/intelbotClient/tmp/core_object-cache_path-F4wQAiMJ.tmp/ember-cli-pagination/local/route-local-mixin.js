define('ember-cli-pagination/local/route-local-mixin', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Mixin.create({
    findPaged: function findPaged(name) {
      return this.store.find(name);
    }
  });

});