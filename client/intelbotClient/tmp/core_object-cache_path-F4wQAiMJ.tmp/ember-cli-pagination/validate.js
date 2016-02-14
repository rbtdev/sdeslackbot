define('ember-cli-pagination/validate', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  var Validate = Ember['default'].Object.extend();

  Validate.reopenClass({
    internalErrors: [],

    internalError: function internalError(str, obj) {
      this.internalErrors.push(str);
      Ember['default'].Logger.warn(str);
      if (obj) {
        Ember['default'].Logger.warn(obj);
      }
    },

    getLastInternalError: function getLastInternalError() {
      return this.internalErrors[this.internalErrors.length - 1];
    }
  });

  exports['default'] = Validate;

});