import Ember from 'ember';

const { Component, guidFor, run, computed } = Ember;

/**
 A simple component to send an action when it passes a distance from the bottom
 of a scrollable element.

 @class EmberICYou
 */

export default Component.extend({

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

  didInsertElement() {
    let selector = this.get('scrollContainer');
    let element = this.$();

    let scrollContainer = selector ? element.closest(selector) : Ember.$(window);

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

  eventNames: computed(function() {
    let guid = guidFor(this);
    return `scroll.${guid} resize.${guid}`;
  }),

  /**
   Deactivates the jQuery listeners.

   @method willDestroyElement
   */

  willDestroyElement() {
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

  activateListeners() {
    let scrollContainer = this.get('scrollContainer'),
        eventNames = this.get('eventNames');

    scrollContainer.on(eventNames, () => {
      run.once(this, '_listenerFired');
    });
  },

  /**
   Deinitializes jQuery listeners.

   @method deactivateListeners
   */

  deactivateListeners() {
    let scrollContainer = this.get('scrollContainer'),
        eventNames = this.get('eventNames');

    scrollContainer.off(eventNames);
  },

  /**
   Activates and deactivates listeners depending on if the component is `enabled`

   @method _switch
   @private
   */

  _switch() {
    let enabled = this.get('enabled');

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

  _listenerFired() {
    let scrollContainer = this.get('scrollContainer'),
        element = this.get('element'),
        triggerDistance = this.get('triggerDistance'),
        previousAboveTheTrigger = this.get('aboveTheTrigger');

    let offsetFromTop = element.offset().top,
        scrollContainerPosition =  scrollContainer.scrollTop(),
        scrollContainerHeight = scrollContainer.height();

    let positionOfMe = offsetFromTop - scrollContainerPosition - scrollContainerHeight;
    let aboveTheTrigger = ( positionOfMe <= triggerDistance );

    if (aboveTheTrigger !== previousAboveTheTrigger) {
      this.set('aboveTheTrigger', aboveTheTrigger);
      run.debounce(this, 'sendAction', 'crossedTheLine', aboveTheTrigger, 50);
    }
  }
});
