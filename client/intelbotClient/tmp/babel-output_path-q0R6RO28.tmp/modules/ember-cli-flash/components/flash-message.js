import Ember from 'ember';
import layout from '../templates/components/flash-message';
import computed from 'ember-new-computed';

var _Ember$String = Ember.String;
var classify = _Ember$String.classify;
var htmlSafe = _Ember$String.htmlSafe;
var Component = Ember.Component;
var getWithDefault = Ember.getWithDefault;
var warn = Ember.warn;
var run = Ember.run;
var on = Ember.on;
var _get = Ember.get;
var set = Ember.set;
var readOnly = computed.readOnly;
var bool = computed.bool;

export default Component.extend({
  layout: layout,
  classNameBindings: ['alertType', 'active', 'exiting'],
  active: false,
  messageStyle: 'bootstrap',
  showProgressBar: readOnly('flash.showProgress'),
  exiting: readOnly('flash.exiting'),

  alertType: computed('flash.type', {
    get: function get() {
      var flashType = getWithDefault(this, 'flash.type', '');
      var messageStyle = getWithDefault(this, 'messageStyle', '');
      var prefix = 'alert alert-';

      if (messageStyle === 'foundation') {
        prefix = 'alert-box ';
      }

      return '' + prefix + flashType;
    },

    set: function set() {
      warn('`alertType` is read only');

      return this;
    }
  }),

  flashType: computed('flash.type', {
    get: function get() {
      var flashType = getWithDefault(this, 'flash.type', '');

      return classify(flashType);
    },

    set: function set() {
      warn('`flashType` is read only');

      return this;
    }
  }),

  _setActive: on('didInsertElement', function () {
    var _this = this;

    run.scheduleOnce('afterRender', this, function () {
      set(_this, 'active', true);
    });
  }),

  progressDuration: computed('flash.showProgress', {
    get: function get() {
      if (!_get(this, 'flash.showProgress')) {
        return false;
      }

      var duration = getWithDefault(this, 'flash.timeout', 0);

      return htmlSafe('transition-duration: ' + duration + 'ms');
    },

    set: function set() {
      warn('`progressDuration` is read only');
    }
  }),

  click: function click() {
    this._destroyFlashMessage();
  },

  willDestroy: function willDestroy() {
    this._super();
    this._destroyFlashMessage();
  },

  // private
  _destroyFlashMessage: function _destroyFlashMessage() {
    var flash = getWithDefault(this, 'flash', false);

    if (flash) {
      flash.destroyMessage();
    }
  },

  hasBlock: bool('template').readOnly()
});