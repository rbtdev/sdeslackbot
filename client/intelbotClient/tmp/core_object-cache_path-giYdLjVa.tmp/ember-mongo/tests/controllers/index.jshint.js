define('ember-mongo/tests/controllers/index.jshint', function () {

  'use strict';

  QUnit.module('JSHint - controllers');
  QUnit.test('controllers/index.js should pass jshint', function(assert) { 
    assert.ok(false, 'controllers/index.js should pass jshint.\ncontrollers/index.js: line 10, col 57, Missing semicolon.\ncontrollers/index.js: line 15, col 62, Missing semicolon.\ncontrollers/index.js: line 36, col 42, Missing semicolon.\ncontrollers/index.js: line 17, col 17, \'_this\' is defined but never used.\ncontrollers/index.js: line 19, col 27, \'note\' is defined but never used.\ncontrollers/index.js: line 40, col 17, \'_this\' is defined but never used.\n\n6 errors'); 
  });

});