

export default objectCompact;
import Ember from 'ember';

var isPresent = Ember.isPresent;

function objectCompact(objectInstance) {
  var compactedObject = {};

  for (var key in objectInstance) {
    var value = objectInstance[key];

    if (isPresent(value)) {
      compactedObject[key] = value;
    }
  }

  return compactedObject;
}