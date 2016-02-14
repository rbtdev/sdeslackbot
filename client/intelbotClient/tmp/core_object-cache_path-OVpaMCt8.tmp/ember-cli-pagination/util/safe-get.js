define('ember-cli-pagination/util/safe-get', ['exports', 'ember', 'ember-cli-pagination/validate', 'ember-cli-pagination/util'], function (exports, Ember, Validate, Util) {

  'use strict';

  exports['default'] = Ember['default'].Mixin.create({
    getInt: function getInt(prop) {
      var raw = this.get(prop);
      if (raw === 0 || raw === "0") {
        // do nothing
      } else if (Util['default'].isBlank(raw)) {
          Validate['default'].internalError("no int for " + prop + " val is " + raw);
        }
      return parseInt(raw);
    }
  });

});