define('ember-mongo/serializers/application', ['exports', 'ember-data'], function (exports, DS) {

  'use strict';

  exports['default'] = DS['default'].RESTSerializer.extend({
    normalizeHash: {
      note: function note(hash) {
        hash.id = hash._id.toString();
        delete hash._id;
        return hash;
      }
    }
  });

});