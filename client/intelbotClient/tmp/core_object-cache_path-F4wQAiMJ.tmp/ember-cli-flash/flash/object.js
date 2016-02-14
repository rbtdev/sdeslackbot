define('ember-cli-flash/flash/object', ['exports', 'ember', 'ember-cli-flash/utils/computed', 'ember-new-computed'], function (exports, Ember, customComputed, ember_new_computed) {

  'use strict';

  var EmberObject = Ember['default'].Object;
  var _Ember$run = Ember['default'].run;
  var later = _Ember$run.later;
  var cancel = _Ember$run.cancel;
  var Evented = Ember['default'].Evented;
  var get = Ember['default'].get;
  var set = Ember['default'].set;
  var readOnly = ember_new_computed['default'].readOnly;

  exports['default'] = EmberObject.extend(Evented, {
    queue: readOnly('flashService.queue'),
    totalTimeout: customComputed['default'].add('timeout', 'extendedTimeout').readOnly(),
    timer: null,
    exitTimer: null,
    exiting: false,

    init: function init() {
      this._super.apply(this, arguments);

      if (get(this, 'sticky')) {
        return;
      }

      this._setTimer('exitTimer', 'exitMessage', get(this, 'timeout'));
      this._setTimer('timer', 'destroyMessage', get(this, 'totalTimeout'));
    },

    destroyMessage: function destroyMessage() {
      var queue = get(this, 'queue');

      if (queue) {
        queue.removeObject(this);
      }

      this.destroy();
      this.trigger('didDestroyMessage');
    },

    exitMessage: function exitMessage() {
      set(this, 'exiting', true);

      this._cancelTimer('exitTimer');
      this.trigger('didExitMessage');
    },

    willDestroy: function willDestroy() {
      var _this = this;

      var timers = ['timer', 'exitTimer'];

      timers.forEach(function (timer) {
        _this._cancelTimer(timer);
      });

      this._super.apply(this, arguments);
    },

    // private
    _guid: customComputed['default'].guidFor('message').readOnly(),

    _setTimer: function _setTimer(name, methodName, timeout) {
      set(this, name, later(this, methodName, timeout));
    },

    _cancelTimer: function _cancelTimer(name) {
      var timer = get(this, name);

      if (timer) {
        cancel(timer);
        set(this, name, null);
      }
    }
  });

});