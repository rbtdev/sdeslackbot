define('ember-mongo/initializers/custom-session', ['exports', 'ember', 'simple-auth/session'], function (exports, Ember, Session) {

  'use strict';

  exports['default'] = {
    name: "custom-session",
    before: "simple-auth",
    initialize: function initialize(container) {
      Session['default'].reopen({
        setCurrentUser: (function () {
          debugger;
          var id = this.get("secure.user_id");
          var self = this;

          if (!Ember['default'].isEmpty(id)) {
            return container.lookup("store:main").find("user", id).then(function (user) {
              self.set("currentUser", user);
            });
          }
        }).observes("secure.user_id")
      });
    }
  };

});