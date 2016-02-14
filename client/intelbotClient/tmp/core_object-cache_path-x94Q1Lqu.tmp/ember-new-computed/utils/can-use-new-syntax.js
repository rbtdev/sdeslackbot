define('ember-new-computed/utils/can-use-new-syntax', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  var supportsSetterGetter;

  try {
    Ember['default'].computed({
      set: function set() {},
      get: function get() {}
    });
    supportsSetterGetter = true;
  } catch (e) {
    supportsSetterGetter = false;
  }

  exports['default'] = supportsSetterGetter;

});