import Ember from 'ember';

export default Ember.Mixin.create({
  findPaged: function findPaged(name) {
    return this.store.find(name);
  }
});