define('ember-ic-you/components/ember-ic-you', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  var Component = Ember['default'].Component;
  var guidFor = Ember['default'].guidFor;
  var run = Ember['default'].run;
  var computed = Ember['default'].computed;

  /**
   A simple component to send an action when it passes a distance from the bottom
   of a scrollable element.

   @class EmberICYou
   */

  exports['default'] = Component.extend({

    classNames: ['ember-ic-you'],

    /**
     The name of the action that will be sent.
     */

    crossedTheLine: 'crossedTheLine',

    /**
     True if the listener can be turned on.
      @property enabled
     @type { Boolean }
     @default true
     */

    enabled: true,

    /**
     The distance from the bottom at which aboveTheLine will be true.
      @property triggerDistance
     @type { Number }
     @default 0
     */

    triggerDistance: 0,

    /**
     Keeps state of page position relative to the component's
     trigger `triggerDistance`
      @property aboveTheTrigger
     @type {Boolean}
     @default false
     */

    aboveTheTrigger: false,

    /**
     Selector for the scrolled container. If null, the container will be the window.
      @property scrollContainer
     @type {String}
     @default null
     */

    scrollContainer: null,

    /**
     Caches the elements that will be used in each scroll cycle, sets an observer
     on `enabled` to fire `_switch`, and calls `_switch`;
      @method didInsertElement
     */

    didInsertElement: function didInsertElement() {
      var selector = this.get('scrollContainer');
      var element = this.$();

      var scrollContainer = selector ? element.closest(selector) : Ember['default'].$(window);

      this.setProperties({
        scrollContainer: scrollContainer,
        element: element
      });

      this.addObserver('enabled', this, '_switch');
      this._switch();
    },

    /**
     The names of the listeners the component will use, concatenated for use by
     jQuery.
      @property eventNames
     @type { String }
     */

    eventNames: computed(function () {
      var guid = guidFor(this);
      return 'scroll.' + guid + ' resize.' + guid;
    }),

    /**
     Deactivates the jQuery listeners.
      @method willDestroyElement
     */

    willDestroyElement: function willDestroyElement() {
      this.deactivateListeners();
      this.setProperties({
        scrollContainer: null,
        element: null
      });
    },

    /**
     Initializes jQuery listeners.
      @method activateListeners
     */

    activateListeners: function activateListeners() {
      var _this = this;

      var scrollContainer = this.get('scrollContainer'),
          eventNames = this.get('eventNames');

      scrollContainer.on(eventNames, function () {
        run.once(_this, '_listenerFired');
      });
    },

    /**
     Deinitializes jQuery listeners.
      @method deactivateListeners
     */

    deactivateListeners: function deactivateListeners() {
      var scrollContainer = this.get('scrollContainer'),
          eventNames = this.get('eventNames');

      scrollContainer.off(eventNames);
    },

    /**
     Activates and deactivates listeners depending on if the component is `enabled`
      @method _switch
     @private
     */

    _switch: function _switch() {
      var enabled = this.get('enabled');

      if (enabled) {
        this.activateListeners();
      } else {
        this.deactivateListeners();
      }
    },

    /**
     Measures the distance of the component from the bottom.
     Debounces `crossedTheLine` action.
      @method _listenerFired
     @private
     */

    _listenerFired: function _listenerFired() {
      var scrollContainer = this.get('scrollContainer'),
          element = this.get('element'),
          triggerDistance = this.get('triggerDistance'),
          previousAboveTheTrigger = this.get('aboveTheTrigger');

      var offsetFromTop = element.offset().top,
          scrollContainerPosition = scrollContainer.scrollTop(),
          scrollContainerHeight = scrollContainer.height();

      var positionOfMe = offsetFromTop - scrollContainerPosition - scrollContainerHeight;
      var aboveTheTrigger = positionOfMe <= triggerDistance;

      if (aboveTheTrigger !== previousAboveTheTrigger) {
        this.set('aboveTheTrigger', aboveTheTrigger);
        run.debounce(this, 'sendAction', 'crossedTheLine', aboveTheTrigger, 50);
      }
    }
  });

});