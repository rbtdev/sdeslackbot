define('ember-mongo/models/user', ['exports', 'ember-data'], function (exports, DS) {

  'use strict';

  exports['default'] = DS['default'].Model.extend({
    name: DS['default'].attr(),
    email: DS['default'].attr(),
    password: DS['default'].attr(),
    isAdmin: DS['default'].attr(),
    avatar: DS['default'].attr()
  });

});