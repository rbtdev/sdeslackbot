import DS from 'ember-data';

export default DS.RESTSerializer.extend({
  normalizeHash: {
    location: function(hash) {
      hash.id = hash._id.toString();
      delete hash._id;
      return hash;
    },
    user: function(hash) {
      hash.id = hash._id.toString();
      delete hash._id;
      return hash;
    }
  }
});