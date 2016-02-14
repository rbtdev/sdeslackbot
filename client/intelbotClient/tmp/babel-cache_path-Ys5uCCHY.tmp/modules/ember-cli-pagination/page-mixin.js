import Ember from 'ember';

export default Ember.Mixin.create({
  getPage: function getPage() {
    return parseInt(this.get('page') || 1);
  },

  getPerPage: function getPerPage() {
    return parseInt(this.get('perPage'));
  }
});