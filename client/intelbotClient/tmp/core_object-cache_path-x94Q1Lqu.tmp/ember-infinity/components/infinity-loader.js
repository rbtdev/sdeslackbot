define('ember-infinity/components/infinity-loader', ['exports', 'ember', 'ember-version-is'], function (exports, Ember, emberVersionIs) {

  'use strict';

  var InfinityLoaderComponent = Ember['default'].Component.extend({
    classNames: ["infinity-loader"],
    classNameBindings: ["infinityModel.reachedInfinity"],
    guid: null,
    eventDebounce: 10,
    loadMoreAction: 'infinityLoad',
    loadingText: 'Loading Infinite Model...',
    loadedText: 'Infinite Model Entirely Loaded.',
    destroyOnInfinity: false,
    developmentMode: false,
    scrollable: null,

    didInsertElement: function didInsertElement() {
      this._super.apply(this, arguments);
      this._setupScrollable();
      this.set('guid', Ember['default'].guidFor(this));
      this._bindEvent('scroll');
      this._bindEvent('resize');
      this._checkIfInView();
    },

    willDestroyElement: function willDestroyElement() {
      this._super.apply(this, arguments);
      this._unbindEvent('scroll');
      this._unbindEvent('resize');
    },

    _bindEvent: function _bindEvent(eventName) {
      var _this = this;

      this.get('_scrollable').on(eventName + '.' + this.get('guid'), function () {
        Ember['default'].run.debounce(_this, _this._checkIfInView, _this.get('eventDebounce'));
      });
    },

    _unbindEvent: function _unbindEvent(eventName) {
      this.get('_scrollable').off(eventName + '.' + this.get('guid'));
    },

    _checkIfInView: function _checkIfInView() {
      var selfOffset = this.$().offset().top;
      var scrollable = this.get("_scrollable");
      var scrollableBottom = scrollable.height() + scrollable.scrollTop();

      var inView = selfOffset < scrollableBottom;

      if (inView && !this.get('developmentMode')) {
        this.sendAction('loadMoreAction');
      }
    },

    _setupScrollable: function _setupScrollable() {
      var scrollable = this.get('scrollable');
      if (Ember['default'].typeOf(scrollable) === 'string') {
        var items = Ember['default'].$(scrollable);
        if (items.length === 1) {
          this.set('_scrollable', items.eq(0));
        } else if (items.length > 1) {
          throw new Error("Ember Infinity: Multiple scrollable elements found for: " + scrollable);
        } else {
          throw new Error("Ember Infinity: No scrollable element found for: " + scrollable);
        }
      } else if (scrollable === undefined || scrollable === null) {
        this.set('_scrollable', Ember['default'].$(window));
      } else {
        throw new Error("Ember Infinity: Scrollable must either be a css selector string or left empty to default to window");
      }
    },

    loadedStatusDidChange: Ember['default'].observer('infinityModel.reachedInfinity', 'destroyOnInfinity', function () {
      if (this.get('infinityModel.reachedInfinity') && this.get('destroyOnInfinity')) {
        this.destroy();
      }
    }),

    infinityModelPushed: Ember['default'].observer('infinityModel.length', function () {
      Ember['default'].run.scheduleOnce('afterRender', this, this._checkIfInView);
    })
  });

  if (emberVersionIs['default']('lessThan', '1.13.0')) {
    InfinityLoaderComponent.reopen({
      hasBlock: Ember['default'].computed.alias('template')
    });
  }

  exports['default'] = InfinityLoaderComponent;

});