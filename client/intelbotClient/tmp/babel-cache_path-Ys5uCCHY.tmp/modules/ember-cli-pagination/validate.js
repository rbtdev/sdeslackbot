import Ember from 'ember';

var Validate = Ember.Object.extend();

Validate.reopenClass({
  internalErrors: [],

  internalError: function internalError(str, obj) {
    this.internalErrors.push(str);
    Ember.Logger.warn(str);
    if (obj) {
      Ember.Logger.warn(obj);
    }
  },

  getLastInternalError: function getLastInternalError() {
    return this.internalErrors[this.internalErrors.length - 1];
  }
});

export default Validate;