define('ember-new-computed/index', ['exports', 'ember', 'ember-new-computed/utils/can-use-new-syntax'], function (exports, Ember, canUseNewSyntax) {

  'use strict';



  exports['default'] = newComputed;

  var computed = Ember['default'].computed;

  function newComputed() {
    var polyfillArguments = [];
    var config = arguments[arguments.length - 1];

    if (typeof config === 'function' || canUseNewSyntax['default']) {
      return computed.apply(undefined, arguments);
    }

    for (var i = 0, l = arguments.length - 1; i < l; i++) {
      polyfillArguments.push(arguments[i]);
    }

    var func;
    if (config.set) {
      func = function (key, value) {
        if (arguments.length > 1) {
          return config.set.call(this, key, value);
        } else {
          return config.get.call(this, key);
        }
      };
    } else {
      func = function (key) {
        return config.get.call(this, key);
      };
    }

    polyfillArguments.push(func);

    return computed.apply(undefined, polyfillArguments);
  }

  var getKeys = Object.keys || Ember['default'].keys;
  var computedKeys = getKeys(computed);

  for (var i = 0, l = computedKeys.length; i < l; i++) {
    newComputed[computedKeys[i]] = computed[computedKeys[i]];
  }

});