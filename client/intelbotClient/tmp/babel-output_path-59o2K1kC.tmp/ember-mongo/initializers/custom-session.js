import Ember from "ember";
import Session from "simple-auth/session";

export default {
  name: "custom-session",
  before: "simple-auth",
  initialize: function initialize(container) {
    Session.reopen({
      setCurrentUser: (function () {
        debugger;
        var id = this.get("secure.user_id");
        var self = this;

        if (!Ember.isEmpty(id)) {
          return container.lookup("store:main").find("user", id).then(function (user) {
            self.set("currentUser", user);
          });
        }
      }).observes("secure.user_id")
    });
  }
};