define('ember-mongo/initializers/flash-messages', ['exports', 'ember-mongo/config/environment'], function (exports, config) {

  'use strict';

  exports.initialize = initialize;

  function initialize() {
    var application = arguments[1] || arguments[0];
    var flashMessageDefaults = config['default'].flashMessageDefaults;
    var injectionFactories = flashMessageDefaults.injectionFactories;

    application.register('config:flash-messages', flashMessageDefaults, { instantiate: false });
    application.inject('service:flash-messages', 'flashMessageDefaults', 'config:flash-messages');

    injectionFactories.forEach(function (factory) {
      application.inject(factory, 'flashMessages', 'service:flash-messages');
    });
  }

  exports['default'] = {
    name: 'flash-messages',
    initialize: initialize
  };

});