define('ember-cli-pagination/page-mixin', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Mixin.create({
    getPage: function getPage() {
      return parseInt(this.get('page') || 1);
    },

    getPerPage: function getPerPage() {
      return parseInt(this.get('perPage'));
    }
  });

});