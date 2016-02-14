define('ember-mongo/tests/unit/routes/signup-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor('route:signup', 'Unit | Route | signup', {
    // Specify the other units that are required for this test.
    // needs: ['controller:foo']
  });

  ember_qunit.test('it exists', function (assert) {
    var route = this.subject();
    assert.ok(route);
  });

});