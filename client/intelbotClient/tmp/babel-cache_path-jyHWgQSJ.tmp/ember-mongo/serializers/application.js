import DS from 'ember-data';

export default DS.RESTSerializer.extend({
  normalizeHash: {
    note: function note(hash) {
      hash.id = hash._id.toString();
      delete hash._id;
      return hash;
    }
  }
});