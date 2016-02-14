define('ember-mongo/tests/unit/controllers/note-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor('controller:note', {
    // Specify the other units that are required for this test.
    // needs: ['controller:foo']
  });

  // Replace this with your real tests.
  ember_qunit.test('it exists', function (assert) {
    var controller = this.subject();
    assert.ok(controller);
  });

});