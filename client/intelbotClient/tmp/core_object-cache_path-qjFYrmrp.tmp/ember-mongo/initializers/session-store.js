define('ember-mongo/initializers/session-store', ['exports'], function (exports) {

  'use strict';

  exports.initialize = initialize;

  function initialize(container, application) {
    application.inject('session:custom', '_store', 'service:store');

    // "store:main" is highly dynamic depepeding on ember-data version
    // in 1.0.0-beta.19 (June 5, 2015) => "store:application"
    // in 1.13 (June 16, 2015) => "service:store"
  }

  exports['default'] = {
    name: 'session-store',
    after: 'ember-data',
    initialize: initialize
  };

});