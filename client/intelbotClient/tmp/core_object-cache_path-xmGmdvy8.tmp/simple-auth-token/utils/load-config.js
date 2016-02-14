define('simple-auth-token/utils/load-config', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = function (defaults, callback) {
    return function (container, config) {
      var wrappedConfig = Ember['default'].Object.create(config);
      for (var property in this) {
        if (this.hasOwnProperty(property) && Ember['default'].typeOf(this[property]) !== 'function') {
          this[property] = wrappedConfig.getWithDefault(property, defaults[property]);
        }
      }
      if (callback) {
        callback.apply(this, [container, config]);
      }
    };
  }

});