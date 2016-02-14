define('ember-version-is/index', ['exports', 'ember', 'ember-data'], function (exports, Ember, DS) {

  'use strict';

  /*global semver*/
  var is = function is(value, operation, version) {
    if (arguments.length === 2 || Ember['default'].isNone(version)) {
      Ember['default'].assert('range must be a valid semver range', semver.validRange(operation));
      return semver.satisfies(value, operation);
    }

    switch (operation) {
      case 'equalTo':
        return semver.eq(value, version);
      case 'greaterThan':
        return semver.gt(value, version);
      case 'greaterThanOrEqualTo':
        return semver.gte(value, version);
      case 'lessThan':
        return semver.lt(value, version);
      case 'lessThanOrEqualTo':
        return semver.lte(value, version);
      default:
        throw new Error("Ember Version Is: Please pass either 'equalTo', 'lessThan', 'lessThanOrEqualTo', 'greaterThan' or 'greatThanOrEqualTo' as the operation argument.");
    }
  };

  var emberVersionIs = function emberVersionIs(operation, value) {
    return is(Ember['default'].VERSION, operation, value);
  };

  var emberDataVersionIs = function emberDataVersionIs(operation, value) {
    return is(DS['default'].VERSION, operation, value);
  };

  exports['default'] = emberVersionIs;

  exports.is = is;
  exports.emberVersionIs = emberVersionIs;
  exports.emberDataVersionIs = emberDataVersionIs;

});