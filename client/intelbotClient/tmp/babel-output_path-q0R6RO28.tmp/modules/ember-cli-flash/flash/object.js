import Ember from 'ember';
import customComputed from '../utils/computed';
import computed from 'ember-new-computed';

var EmberObject = Ember.Object;
var _Ember$run = Ember.run;
var later = _Ember$run.later;
var cancel = _Ember$run.cancel;
var Evented = Ember.Evented;
var get = Ember.get;
var set = Ember.set;
var readOnly = computed.readOnly;

export default EmberObject.extend(Evented, {
  queue: readOnly('flashService.queue'),
  totalTimeout: customComputed.add('timeout', 'extendedTimeout').readOnly(),
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
  _guid: customComputed.guidFor('message').readOnly(),

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