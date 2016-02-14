define('ember-mongo/initializers/simple-auth-token', ['exports', 'simple-auth-token/authenticators/token', 'simple-auth-token/authenticators/jwt', 'simple-auth-token/authorizers/token', 'simple-auth-token/configuration', 'ember-mongo/config/environment'], function (exports, TokenAuthenticator, JWTAuthenticator, Authorizer, Configuration, ENV) {

  'use strict';

  exports['default'] = {
    name: 'simple-auth-token',
    before: 'simple-auth',
    initialize: function initialize(container) {
      Configuration['default'].load(container, ENV['default']['simple-auth-token'] || {});
      container.register('simple-auth-authorizer:token', Authorizer['default']);
      container.register('simple-auth-authenticator:token', TokenAuthenticator['default']);
      container.register('simple-auth-authenticator:jwt', JWTAuthenticator['default']);
    }
  };

});