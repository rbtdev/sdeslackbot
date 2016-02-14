define('ember-cli-flash/components/flash-message', ['exports', 'ember', 'ember-cli-flash/templates/components/flash-message', 'ember-new-computed'], function (exports, Ember, layout, computed) {

  'use strict';

  var _Ember$String = Ember['default'].String;
  var classify = _Ember$String.classify;
  var htmlSafe = _Ember$String.htmlSafe;
  var Component = Ember['default'].Component;
  var getWithDefault = Ember['default'].getWithDefault;
  var warn = Ember['default'].warn;
  var run = Ember['default'].run;
  var on = Ember['default'].on;
  var _get = Ember['default'].get;
  var set = Ember['default'].set;
  var readOnly = computed['default'].readOnly;
  var bool = computed['default'].bool;

  exports['default'] = Component.extend({
    layout: layout['default'],
    classNameBindings: ['alertType', 'active', 'exiting'],
    active: false,
    messageStyle: 'bootstrap',
    showProgressBar: readOnly('flash.showProgress'),
    exiting: readOnly('flash.exiting'),

    alertType: computed['default']('flash.type', {
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

    flashType: computed['default']('flash.type', {
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

    progressDuration: computed['default']('flash.showProgress', {
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

});