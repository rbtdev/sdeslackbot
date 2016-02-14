define('ember-mongo/services/validators', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].ArrayProxy.extend({
    content: []
  });

});