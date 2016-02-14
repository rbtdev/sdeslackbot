define('ember-mongo/router', ['exports', 'ember', 'ember-mongo/config/environment'], function (exports, Ember, config) {

  'use strict';

  var Router = Ember['default'].Router.extend({
    location: config['default'].locationType
  });

  Router.map(function () {
    this.route('about', {});
    this.route('contact', {});
    this.route('login');
    this.route('signup');
    this.route('profile');
  });

  exports['default'] = Router;

});