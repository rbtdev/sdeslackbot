define('ember-cli-app-version/components/app-version', ['exports', 'ember', 'ember-cli-app-version/templates/app-version'], function (exports, Ember, layout) {

  'use strict';

  exports['default'] = Ember['default'].Component.extend({
    tagName: 'span',
    layout: layout['default']
  });

});
define('ember-cli-app-version/initializer-factory', ['exports', 'ember'], function (exports, Ember) {

  'use strict';



  exports['default'] = initializerFactory;
  var classify = Ember['default'].String.classify;

  function initializerFactory(name, version) {
    var registered = false;

    return function () {
      if (!registered && name && version) {
        var appName = classify(name);
        Ember['default'].libraries.register(appName, version);
        registered = true;
      }
    };
  }

});
define('ember-cli-app-version/templates/app-version', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      meta: {
        "revision": "Ember@1.13.7",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 2,
            "column": 0
          }
        },
        "moduleName": "modules/ember-cli-app-version/templates/app-version.hbs"
      },
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var morphs = new Array(1);
        morphs[0] = dom.createMorphAt(fragment,0,0,contextualElement);
        dom.insertBoundary(fragment, 0);
        return morphs;
      },
      statements: [
        ["content","version",["loc",[null,[1,0],[1,11]]]]
      ],
      locals: [],
      templates: []
    };
  }()));

});
define('ember-cli-app-version', ['ember-cli-app-version/index', 'ember', 'exports'], function(__index__, __Ember__, __exports__) {
  'use strict';
  var keys = Object.keys || __Ember__['default'].keys;
  var forEach = Array.prototype.forEach && function(array, cb) {
    array.forEach(cb);
  } || __Ember__['default'].EnumerableUtils.forEach;

  forEach(keys(__index__), (function(key) {
    __exports__[key] = __index__[key];
  }));
});

define('ember-cli-content-security-policy', ['ember-cli-content-security-policy/index', 'ember', 'exports'], function(__index__, __Ember__, __exports__) {
  'use strict';
  var keys = Object.keys || __Ember__['default'].keys;
  var forEach = Array.prototype.forEach && function(array, cb) {
    array.forEach(cb);
  } || __Ember__['default'].EnumerableUtils.forEach;

  forEach(keys(__index__), (function(key) {
    __exports__[key] = __index__[key];
  }));
});

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
define('ember-cli-flash/services/flash-messages', ['exports', 'ember', 'ember-cli-flash/flash/object', 'ember-cli-flash/utils/object-without', 'ember-new-computed'], function (exports, Ember, FlashMessage, objectWithout, computed) {

  'use strict';

  var Service = Ember['default'].Service;
  var assert = Ember['default'].assert;
  var copy = Ember['default'].copy;
  var getWithDefault = Ember['default'].getWithDefault;
  var isNone = Ember['default'].isNone;
  var merge = Ember['default'].merge;
  var setProperties = Ember['default'].setProperties;
  var typeOf = Ember['default'].typeOf;
  var warn = Ember['default'].warn;
  var get = Ember['default'].get;
  var set = Ember['default'].set;
  var classify = Ember['default'].String.classify;
  var emberArray = Ember['default'].A;
  var equal = computed['default'].equal;
  var sort = computed['default'].sort;
  var mapBy = computed['default'].mapBy;

  exports['default'] = Service.extend({
    isEmpty: equal('queue.length', 0).readOnly(),

    arrangedQueue: sort('queue', function (a, b) {
      if (a.priority < b.priority) {
        return 1;
      } else if (a.priority > b.priority) {
        return -1;
      }
      return 0;
    }).readOnly(),

    _guids: mapBy('queue', '_guid').readOnly(),

    init: function init() {
      this._super.apply(this, arguments);
      this._setDefaults();
      this.queue = emberArray();
    },

    add: function add() {
      var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      return this._enqueue(this._newFlashMessage(options));
    },

    clearMessages: function clearMessages() {
      var flashes = get(this, 'queue');

      if (isNone(flashes)) {
        return;
      }

      return flashes.clear();
    },

    registerTypes: function registerTypes() {
      var _this = this;

      var types = arguments.length <= 0 || arguments[0] === undefined ? emberArray() : arguments[0];

      types.forEach(function (type) {
        return _this._registerType(type);
      });
    },

    _newFlashMessage: function _newFlashMessage() {
      var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      assert('The flash message cannot be empty.', options.message);

      var flashService = this;
      var allDefaults = getWithDefault(this, 'flashMessageDefaults', {});
      var defaults = objectWithout['default'](allDefaults, ['types', 'injectionFactories', 'preventDuplicates']);

      var flashMessageOptions = merge(copy(defaults), { flashService: flashService });

      for (var key in options) {
        var value = get(options, key);
        var option = this._getOptionOrDefault(key, value);

        set(flashMessageOptions, key, option);
      }

      return FlashMessage['default'].create(flashMessageOptions);
    },

    _getOptionOrDefault: function _getOptionOrDefault(key, value) {
      var defaults = getWithDefault(this, 'flashMessageDefaults', {});
      var defaultOption = get(defaults, key);

      if (typeOf(value) === 'undefined') {
        return defaultOption;
      }

      return value;
    },

    _setDefaults: function _setDefaults() {
      var defaults = getWithDefault(this, 'flashMessageDefaults', {});

      for (var key in defaults) {
        var classifiedKey = classify(key);
        var defaultKey = 'default' + classifiedKey;

        set(this, defaultKey, defaults[key]);
      }

      this.registerTypes(getWithDefault(this, 'defaultTypes', emberArray()));
    },

    _registerType: function _registerType(type) {
      var _this2 = this;

      assert('The flash type cannot be undefined', type);

      this[type] = function (message) {
        var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

        var flashMessageOptions = copy(options);
        setProperties(flashMessageOptions, { message: message, type: type });

        return _this2.add(flashMessageOptions);
      };
    },

    _hasDuplicate: function _hasDuplicate(guid) {
      return get(this, '_guids').contains(guid);
    },

    _enqueue: function _enqueue(flashInstance) {
      var preventDuplicates = get(this, 'defaultPreventDuplicates');
      var guid = get(flashInstance, '_guid');

      if (preventDuplicates && this._hasDuplicate(guid)) {
        warn('Attempting to add a duplicate message to the Flash Messages Service');
        return;
      }

      return get(this, 'queue').pushObject(flashInstance);
    }
  });

});
define('ember-cli-flash/templates/components/flash-message', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        meta: {
          "revision": "Ember@1.13.7",
          "loc": {
            "source": null,
            "start": {
              "line": 1,
              "column": 0
            },
            "end": {
              "line": 3,
              "column": 0
            }
          },
          "moduleName": "modules/ember-cli-flash/templates/components/flash-message.hbs"
        },
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment,1,1,contextualElement);
          return morphs;
        },
        statements: [
          ["inline","yield",[["get","this",["loc",[null,[2,10],[2,14]]]],["get","flash",["loc",[null,[2,15],[2,20]]]]],[],["loc",[null,[2,2],[2,22]]]]
        ],
        locals: [],
        templates: []
      };
    }());
    var child1 = (function() {
      var child0 = (function() {
        return {
          meta: {
            "revision": "Ember@1.13.7",
            "loc": {
              "source": null,
              "start": {
                "line": 5,
                "column": 2
              },
              "end": {
                "line": 9,
                "column": 2
              }
            },
            "moduleName": "modules/ember-cli-flash/templates/components/flash-message.hbs"
          },
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("    ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("div");
            dom.setAttribute(el1,"class","alert-progress");
            var el2 = dom.createTextNode("\n      ");
            dom.appendChild(el1, el2);
            var el2 = dom.createElement("div");
            dom.setAttribute(el2,"class","alert-progressBar");
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n    ");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var element0 = dom.childAt(fragment, [1, 1]);
            var morphs = new Array(1);
            morphs[0] = dom.createAttrMorph(element0, 'style');
            return morphs;
          },
          statements: [
            ["attribute","style",["get","progressDuration",["loc",[null,[7,45],[7,61]]]]]
          ],
          locals: [],
          templates: []
        };
      }());
      return {
        meta: {
          "revision": "Ember@1.13.7",
          "loc": {
            "source": null,
            "start": {
              "line": 3,
              "column": 0
            },
            "end": {
              "line": 10,
              "column": 0
            }
          },
          "moduleName": "modules/ember-cli-flash/templates/components/flash-message.hbs"
        },
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(2);
          morphs[0] = dom.createMorphAt(fragment,1,1,contextualElement);
          morphs[1] = dom.createMorphAt(fragment,3,3,contextualElement);
          dom.insertBoundary(fragment, null);
          return morphs;
        },
        statements: [
          ["content","flash.message",["loc",[null,[4,2],[4,19]]]],
          ["block","if",[["get","showProgressBar",["loc",[null,[5,8],[5,23]]]]],[],0,null,["loc",[null,[5,2],[9,9]]]]
        ],
        locals: [],
        templates: [child0]
      };
    }());
    return {
      meta: {
        "revision": "Ember@1.13.7",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 11,
            "column": 0
          }
        },
        "moduleName": "modules/ember-cli-flash/templates/components/flash-message.hbs"
      },
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var morphs = new Array(1);
        morphs[0] = dom.createMorphAt(fragment,0,0,contextualElement);
        dom.insertBoundary(fragment, 0);
        dom.insertBoundary(fragment, null);
        return morphs;
      },
      statements: [
        ["block","if",[["get","hasBlock",["loc",[null,[1,6],[1,14]]]]],[],0,1,["loc",[null,[1,0],[10,7]]]]
      ],
      locals: [],
      templates: [child0, child1]
    };
  }()));

});
define('ember-cli-flash/utils/computed', ['exports', 'ember', 'ember-new-computed'], function (exports, Ember, computed) {

  'use strict';

  exports.add = add;
  exports.guidFor = guidFor;

  var typeOf = Ember['default'].typeOf;
  var _get = Ember['default'].get;
  var emberGuidFor = Ember['default'].guidFor;
  var emberArray = Ember['default'].A;

  function add() {
    for (var _len = arguments.length, dependentKeys = Array(_len), _key = 0; _key < _len; _key++) {
      dependentKeys[_key] = arguments[_key];
    }

    var computedFunc = computed['default']({
      get: function get() {
        var _this = this;

        var values = dependentKeys.map(function (dependentKey) {
          var value = _get(_this, dependentKey);

          if (typeOf(value) !== 'number') {
            return;
          }

          return value;
        });

        return emberArray(values).compact().reduce(function (prev, curr) {
          return prev + curr;
        });
      }
    });

    return computedFunc.property.apply(computedFunc, dependentKeys);
  }

  function guidFor(dependentKey) {
    return computed['default'](dependentKey, {
      get: function get() {
        var value = _get(this, dependentKey);

        return emberGuidFor(value);
      }
    });
  }

});
define('ember-cli-flash/utils/object-compact', ['exports', 'ember'], function (exports, Ember) {

  'use strict';



  exports['default'] = objectCompact;
  var isPresent = Ember['default'].isPresent;

  function objectCompact(objectInstance) {
    var compactedObject = {};

    for (var key in objectInstance) {
      var value = objectInstance[key];

      if (isPresent(value)) {
        compactedObject[key] = value;
      }
    }

    return compactedObject;
  }

});
define('ember-cli-flash/utils/object-only', ['exports'], function (exports) {

  'use strict';

  exports['default'] = objectWithout;

  function objectWithout() {
    var originalObj = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
    var keysToRemain = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];

    var newObj = {};

    for (var key in originalObj) {
      if (keysToRemain.indexOf(key) !== -1) {
        newObj[key] = originalObj[key];
      }
    }

    return newObj;
  }

});
define('ember-cli-flash/utils/object-without', ['exports'], function (exports) {

  'use strict';

  exports['default'] = objectWithout;

  function objectWithout() {
    var originalObj = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
    var keysToRemove = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];

    var newObj = {};

    for (var key in originalObj) {
      if (keysToRemove.indexOf(key) === -1) {
        newObj[key] = originalObj[key];
      }
    }

    return newObj;
  }

});
define('ember-cli-flash', ['ember-cli-flash/index', 'ember', 'exports'], function(__index__, __Ember__, __exports__) {
  'use strict';
  var keys = Object.keys || __Ember__['default'].keys;
  var forEach = Array.prototype.forEach && function(array, cb) {
    array.forEach(cb);
  } || __Ember__['default'].EnumerableUtils.forEach;

  forEach(keys(__index__), (function(key) {
    __exports__[key] = __index__[key];
  }));
});

define('ember-cli-infinite-scroll/components/infinite-scroll-container', ['exports', 'ember', 'ember-cli-infinite-scroll/mixins/infinite-scroll'], function (exports, Ember, InfiniteScrollMixin) {

  'use strict';

  var Component = Ember['default'].Component;

  /**
   A component that contains infinite scrolled content.

   @class InfiniteScrollContainerComponent
   @uses InfiniteScrollMixin
   */

  exports['default'] = Component.extend(InfiniteScrollMixin['default'], {
    classNames: 'infinite-scroll-container',

    /**
     Will be passed into the scroll listener to be the observed element on scroll.
      @property scrollContainer
     @type { String }
     @default '.infinite-scroll-container'
     */

    scrollContainer: '.infinite-scroll-container',

    /**
     Gives the component access to the store and starts the infinite query.
      @method didInsertElement
     */

    didInsertElement: function didInsertElement() {
      var store = this.container.lookup('store:main');
      this.set('store', store);
      this.infiniteQuery();
    },

    /**
     Record processing or anything else that needs to happen with the returned
     records.
      @method afterInfiniteQuery
     @param  newRecords { Object } the records returned in this cycle
     */

    afterInfiniteQuery: function afterInfiniteQuery(newRecords) {
      var infiniteContentPropertyName = this.get('infiniteContentPropertyName');
      var model = this.get(infiniteContentPropertyName);

      if (model) {
        model.addObjects(newRecords.get('content'));
      } else {
        this.set(infiniteContentPropertyName, newRecords);
      }
    }
  });

});
define('ember-cli-infinite-scroll/components/infinite-scroll', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  var Component = Ember['default'].Component;

  /**
   A component to trigger infinite scroll.

   @class InfiniteScrollComponent
   */

  exports['default'] = Component.extend({

    /**
     The name of the method to trigger
      @property performInfinite
     @type { String }
     @default 'performInfinite
     */

    performInfinite: 'performInfinite',

    /**
     The distance from the bottom at which the infinite scroll will fire.
      @property triggerDistance
     @type { Number }
     @default 0
     */

    triggerDistance: 0,

    /**
     Whether or not the infinite scroll can be triggered.
      @property infiniteScrollAvailable
     @type { Boolean }
     @default true
     */

    infiniteScrollAvailable: true,

    actions: {

      /**
       Triggers the `performInfinite` method.
        @event performInfinite
       */

      performInfinite: function performInfinite() {
        this.sendAction('performInfinite');
      }
    }
  });

});
define('ember-cli-infinite-scroll/mixins/infinite-scroll-route', ['exports', 'ember', 'ember-cli-infinite-scroll/mixins/infinite-scroll'], function (exports, Ember, InfiniteScrollMixin) {

  'use strict';

  var Mixin = Ember['default'].Mixin;
  var computed = Ember['default'].computed;
  var on = Ember['default'].on;

  /**
   A mixin for routes that need infinite scrolling.

   @class InfiniteScrollRouteMixin
   @uses InfiniteScrollMixin
   */

  exports['default'] = Mixin.create(InfiniteScrollMixin['default'], {

    /**
     Sets defaults for `infiniteScrollAvailable` and `hasMoreContent`
      @method beforeModel
     */

    beforeModel: function beforeModel() {
      this.set('infiniteScrollAvailable', true);
      this.set('hasMoreContent', true);
    },

    /**
     Delegates a given property to the related controller (or specified controller
     if `controllerName` is defined. This is useful so that properties are
     available to use on the controller.
      @param property { String } the property to get or set
     @param value the value of the propery to set
     */

    coerceControllerAlias: function coerceControllerAlias(property, value) {
      var controllerName = this.get('controllerName') || this.get('routeName');
      var controller = this.get('controller') || this.controllerFor(controllerName);
      if ('undefined' !== typeof value) {
        controller.set(property, value);
        return value;
      } else {
        return controller.get(property);
      }
    },

    /**
     True if the infinite scroll can be used.
      @property infiniteScrollAvailable
     @type { Boolean }
     */

    infiniteScrollAvailable: computed(function (key, value) {
      return this.coerceControllerAlias('infiniteScrollAvailable', value);
    }),

    /**
     True if it should continue making calls for new content.
      @property hasMoreContent
     @type { Boolean }
     */

    hasMoreContent: computed(function (key, value) {
      return this.coerceControllerAlias('hasMoreContent', value);
    }),

    /**
     True if a query has been started but not finished.
      @property infiniteQuerying
     @type { Boolean }
     */

    infiniteQuerying: computed(function (key, value) {
      return this.coerceControllerAlias('infiniteQuerying', value);
    }),

    /**
     The name of the model that the infinite content will be added to.
      @property infiniteContentPropertyName
     @type { String }
     @default 'controller.model'
     */

    infiniteContentPropertyName: 'controller.model',

    /**
     Resets the property defined by `infiniteIncrementProperty` on
     `willTransition`.
      @method _resetProperties
     @private
     */

    _resetProperties: on('willTransition', function () {
      var infiniteIncrementProperty = this.get('infiniteIncrementProperty');
      this.set(infiniteIncrementProperty, 0);
    })
  });

});
define('ember-cli-infinite-scroll/mixins/infinite-scroll', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  var Mixin = Ember['default'].Mixin;
  var run = Ember['default'].run;
  var computed = Ember['default'].computed;

  /**
   A mixin for infinite scrolls.

   @class InfiniteScrollMixin
   */

  exports['default'] = Mixin.create({

    /**
     True if a request has been initiated but not resolved.
      @property infiniteQuerying
     @default false
     */

    infiniteQuerying: false,

    /**
     The number of queries that have cycled.
      @property _cycleCount
     @type { Number }
     @default 0
     @private
     */

    _cycleCount: 0,

    /**
     True if the query can be sent.
      @property infiniteScrollAvailable
     @default true
     */

    infiniteScrollAvailable: true,

    /**
     True if there is more content on the server.
      @property hasMoreContent
     @type { Boolean }
     @default true
     */

    hasMoreContent: true,

    /**
     The start param.
      @property start
     @type { Number }
     @default 0
     */

    start: 0,

    /**
     The limit param.
      @property limit
     @type { Number }
     @default 12
     */

    limit: 12,

    /**
     The property that will be incremented after each cycle.
      @property infiniteIncrementProperty
     @type { String }
     @default 'start'
     */

    infiniteIncrementProperty: 'start',

    /**
     The property that will increment `infiniteIncrementProperty`.
      @property infiniteIncrementBy
     @type { String }
     @default 'limit'
     */

    infiniteIncrementBy: 'limit',

    /**
     The name of the property that the `infiniteScroll` records will be added to.
      @property infiniteContentPropertyName
     @type { String }
     @default 'model'
     */

    infiniteContentPropertyName: 'model',

    /**
     The model name that will be queried.
      @property infiniteModelType
     @type { String }
     @default ''
     */

    infiniteModelName: '',

    /**
     The default parameters.
      @property _fullQueryParams
     @default ['start', 'limit']
     @private
     */

    _fullQueryParams: computed('infiniteIncrementBy', 'infiniteIncrementProperty', 'infiniteQueryParams', function () {
      var defaultQueryParams = [this.get('infiniteIncrementBy'), this.get('infiniteIncrementProperty')];
      var infiniteQueryParams = this.get('infiniteQueryParams');
      return defaultQueryParams.concat(infiniteQueryParams);
    }),

    /**
     An array of params that are needed for the infinite query.
      @property infiniteQueryParams
     @type { Array }
     @default []
     */

    infiniteQueryParams: [],

    /**
     Does what's needed for the infinite scroll.
     - sets `infiniteQuerying` to `true`
     - if passed `modelName`, sets `infiniteModelName`
     - if passed `params`, sets `infiniteQueryParams`
     - calls `beforeInfiniteQuery`
     - calls `infiniteQuery`
     then:
     - calls `afterInfiniteQuery`
     - calls `_updateInfiniteProperties`
     - sets ` infiniteQuerying` to `false`
      @method performInfinite
     @param modelName { String } the model to be queried
     @param params { Object } params to use in the query
     @returns { Promise } the records
     */

    infiniteQuery: function infiniteQuery(modelName, params) {
      var _this = this;

      if (this.get('infiniteQuerying') || !this.get('infiniteScrollAvailable')) {
        return;
      }
      this.set('infiniteQuerying', true);

      if (modelName) {
        this.set('infiniteModelName', modelName);
      }

      if (params) {
        var paramsToSet = Ember['default'].keys(params);
        this.set('infiniteQueryParams', paramsToSet);
        this.setProperties(params);
      }

      var infiniteModelName = this.get('infiniteModelName');
      var fullQueryParams = this.get('_fullQueryParams');

      params = this.getProperties(fullQueryParams);

      this.beforeInfiniteQuery(params);
      var newRecords = this.infiniteDataQuery(infiniteModelName, params);
      newRecords.then(function (records) {
        var returnedContentLength = records.get('length');

        _this.afterInfiniteQuery(records);
        _this._updateInfiniteProperties(returnedContentLength);
        _this.set('infiniteQuerying', false);
      });

      return newRecords;
    },

    /**
     Called immediately before the infinite query starts.
      @method beforeInfiniteQuery
     @param params { Object } the params that will be used in the query
     */

    beforeInfiniteQuery: Ember['default'].K,

    /**
     The query that will be used.
      @method infiniteQuery
     @param modelName { String } the name of the model
     @param params { Object } the params that will be used in the query
     @return { Promise } the records
     */

    infiniteDataQuery: function infiniteDataQuery(modelName) {
      var params = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      return this.store.query(modelName, params);
    },

    /**
     Record processing or anything else that needs to happen with the returned
     records.
      @method afterInfiniteQuery
     @param  newRecords { Object } the records returned in this cycle
     */

    afterInfiniteQuery: function afterInfiniteQuery(newRecords) {
      var contentPropertyName = this.get('infiniteContentPropertyName');
      var model = this.get(contentPropertyName);

      if (model) {
        model.addObjects(newRecords.get('content'));
      }
    },

    /**
     Calls `_updateInfiniteCount` and `updateInfiniteAvailable`.
      @method _updateScrollProperties
     @param addedLength { Number } the incremental length of the model
     @private
     */

    _updateInfiniteProperties: function _updateInfiniteProperties(addedLength) {
      this._updateInfiniteCount(addedLength);
      this.updateHasMoreContent(addedLength);
      this.incrementProperty('_cycleCount');
    },

    /**
     Increments a property after the infinite scroll is finished.
      @method _updateInfiniteCount
     @param addedLength { Number } the incremental length of the model
     @private
     */

    _updateInfiniteCount: function _updateInfiniteCount(addedLength) {
      var incrementProperty = this.get('infiniteIncrementProperty');

      this.incrementProperty(incrementProperty, addedLength);
    },

    /**
     Determines whether the infinite scroll should continue after it finishes.
      @method updateHasMoreContent
     @param addedLength { Number } the incremental length of the model
     */

    updateHasMoreContent: function updateHasMoreContent(addedLength) {
      var infiniteIncrementBy = this.get('infiniteIncrementBy');
      var shouldIncrement = this.get(infiniteIncrementBy);
      var hasMoreContent = addedLength >= shouldIncrement;
      this.set('hasMoreContent', hasMoreContent);
      this.set('infiniteScrollAvailable', hasMoreContent);
    },

    actions: {

      /**
       Debounces `_performInfinite`
        @event performInfinite
       */

      performInfinite: function performInfinite() {
        run.once(this, this.infiniteQuery);
      }
    }
  });

});
define('ember-cli-infinite-scroll', ['ember-cli-infinite-scroll/index', 'ember', 'exports'], function(__index__, __Ember__, __exports__) {
  'use strict';
  var keys = Object.keys || __Ember__['default'].keys;
  var forEach = Array.prototype.forEach && function(array, cb) {
    array.forEach(cb);
  } || __Ember__['default'].EnumerableUtils.forEach;

  forEach(keys(__index__), (function(key) {
    __exports__[key] = __index__[key];
  }));
});

define('ember-cli-pagination/computed/paged-array', ['exports', 'ember', 'ember-cli-pagination/local/paged-array', 'ember-cli-pagination/infinite/paged-infinite-array'], function (exports, Ember, PagedArray, PagedInfiniteArray) {

  'use strict';

  function makeLocal(contentProperty, ops) {
    return Ember['default'].computed("", function () {
      var pagedOps = {}; //{content: this.get(contentProperty)};
      pagedOps.parent = this;

      var getVal = function getVal(key, val) {
        if (key.match(/Binding$/)) {
          return "parent." + val;
          //return Ember.Binding.oneWay("parent."+val);
        } else {
            return val;
          }
      };

      for (var key in ops) {
        pagedOps[key] = getVal(key, ops[key]);
      }

      var paged = PagedArray['default'].extend({
        contentBinding: "parent." + contentProperty
      }).create(pagedOps);
      // paged.lockToRange();
      return paged;
    });
  }

  function makeInfiniteWithPagedSource(contentProperty /*, ops */) {
    return Ember['default'].computed(function () {
      return PagedInfiniteArray['default'].create({ all: this.get(contentProperty) });
    });
  }

  function makeInfiniteWithUnpagedSource(contentProperty, ops) {
    return Ember['default'].computed(function () {
      ops.all = this.get(contentProperty);
      return PagedInfiniteArray['default'].createFromUnpaged(ops);
    });
  }

  exports['default'] = function (contentProperty, ops) {
    ops = ops || {};

    if (ops.infinite === true) {
      return makeInfiniteWithPagedSource(contentProperty, ops);
    } else if (ops.infinite) {
      return makeInfiniteWithUnpagedSource(contentProperty, ops);
    } else {
      return makeLocal(contentProperty, ops);
    }
  }

});
define('ember-cli-pagination/divide-into-pages', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Object.extend({
    objsForPage: function objsForPage(page) {
      var range = this.range(page);
      return this.get('all').slice(range.start, range.end + 1);
    },

    totalPages: function totalPages() {
      var allLength = parseInt(this.get('all.length'));
      var perPage = parseInt(this.get('perPage'));
      return Math.ceil(allLength / perPage);
    },

    range: function range(page) {
      var perPage = parseInt(this.get('perPage'));
      var s = (parseInt(page) - 1) * perPage;
      var e = s + perPage - 1;

      return { start: s, end: e };
    }
  });

});
define('ember-cli-pagination/factory', ['exports', 'ember', 'ember-cli-pagination/remote/controller-mixin', 'ember-cli-pagination/local/controller-local-mixin', 'ember-cli-pagination/remote/route-mixin', 'ember-cli-pagination/local/route-local-mixin'], function (exports, Ember, PageControllerMixin, PageControllerLocalMixin, PageRouteMixin, PageRouteLocalMixin) {

  'use strict';

  var Factory = Ember['default'].Object.extend({
    paginationTypeInner: function paginationTypeInner() {
      var res = this.get('config').paginationType;
      if (res) {
        return res;
      }
      var ops = this.get('config').pagination;
      if (ops) {
        return ops.type;
      }
      return null;
    },

    paginationType: function paginationType() {
      var res = this.paginationTypeInner();
      if (!(res === "local" || res === "remote")) {
        throw "unknown pagination type";
      }
      return res;
    },

    controllerMixin: function controllerMixin() {
      return ({
        local: PageControllerLocalMixin['default'],
        remote: PageControllerMixin['default']
      })[this.paginationType()];
    },

    routeMixin: function routeMixin() {
      return ({
        local: PageRouteLocalMixin['default'],
        remote: PageRouteMixin['default']
      })[this.paginationType()];
    }
  });

  Factory.reopenClass({
    controllerMixin: function controllerMixin(config) {
      return Factory.create({ config: config }).controllerMixin();
    },
    routeMixin: function routeMixin(config) {
      return Factory.create({ config: config }).routeMixin();
    }
  });

  exports['default'] = Factory;

});
define('ember-cli-pagination/infinite/paged-infinite-array', ['exports', 'ember', 'ember-cli-pagination/local/paged-array'], function (exports, Ember, PagedArray) {

  'use strict';

  var toArray = function toArray(a) {
    var res = [];
    if (a.forEach) {
      a.forEach(function (obj) {
        res.push(obj);
      });
    } else {
      res = a;
    }
    return res;
  };

  var pushPromiseObjects = function pushPromiseObjects(base, promise) {
    if (!base) {
      throw "pushPromiseObjects no base";
    }
    if (!promise) {
      throw "pushPromiseObjects no promise";
    }

    if (!promise.then) {
      throw "pushPromiseObjects no promise.then";
    }

    if (!base.pushObjects) {
      throw "pushPromiseObjects no base.pushObjects";
    }

    promise.then(function (r) {
      base.pushObjects(toArray(r));
    });
    return promise;
  };

  var InfiniteBase = Ember['default'].ArrayProxy.extend({
    page: 1,

    arrangedContent: (function () {
      return this.get('content');
    }).property('content.[]'),

    init: function init() {
      this.set('content', []);
      this.addRecordsForPage(1);
    },

    loadNextPage: function loadNextPage() {
      this.incrementProperty('page');
      var page = this.get('page');
      return this.addRecordsForPage(page);
    },

    addRecordsForPage: function addRecordsForPage(page) {
      var arr = this.getRecordsForPage(page);
      return pushPromiseObjects(this.get('content'), arr);
    },

    getRecordsForPage: function getRecordsForPage() /* page */{
      throw "Not Implemented";
    }
  });

  var c = InfiniteBase.extend({
    getRecordsForPage: function getRecordsForPage(page) {
      var c = this.get('all');
      c.set('page', page);
      return c;
    },

    then: function then(f, f2) {
      this.get('all').then(f, f2);
    }
  });

  c.reopenClass({
    createFromUnpaged: function createFromUnpaged(ops) {
      var unpaged = ops.all;
      var perPage = ops.perPage || 10;
      var paged = PagedArray['default'].create({ perPage: perPage, content: unpaged });
      return this.create({ all: paged });
    }
  });

  exports['default'] = c;

});
define('ember-cli-pagination/lib/page-items', ['exports', 'ember', 'ember-cli-pagination/util', 'ember-cli-pagination/lib/truncate-pages', 'ember-cli-pagination/util/safe-get'], function (exports, Ember, Util, TruncatePages, SafeGet) {

  'use strict';

  exports['default'] = Ember['default'].Object.extend(SafeGet['default'], {
    pageItemsAll: (function () {
      var currentPage = this.getInt("currentPage");
      var totalPages = this.getInt("totalPages");
      Util['default'].log("PageNumbers#pageItems, currentPage " + currentPage + ", totalPages " + totalPages);

      var res = [];

      for (var i = 1; i <= totalPages; i++) {
        res.push({
          page: i,
          current: currentPage === i,
          dots: false
        });
      }
      return res;
    }).property("currentPage", "totalPages"),

    pageItemsTruncated: (function () {
      var currentPage = this.getInt('currentPage');
      var totalPages = this.getInt("totalPages");
      var toShow = this.getInt('numPagesToShow');
      var showFL = this.get('showFL');

      var t = TruncatePages['default'].create({ currentPage: currentPage, totalPages: totalPages,
        numPagesToShow: toShow,
        showFL: showFL });
      var pages = t.get('pagesToShow');
      var next = pages[0];

      return pages.map(function (page) {
        var h = {
          page: page,
          current: currentPage === page,
          dots: next !== page
        };
        next = page + 1;
        return h;
      });
    }).property('currentPage', 'totalPages', 'numPagesToShow', 'showFL'),

    pageItems: (function () {
      if (this.get('truncatePages')) {
        return this.get('pageItemsTruncated');
      } else {
        return this.get('pageItemsAll');
      }
    }).property('currentPage', 'totalPages', 'truncatePages', 'numPagesToShow')
  });

});
define('ember-cli-pagination/lib/truncate-pages', ['exports', 'ember', 'ember-cli-pagination/util/safe-get'], function (exports, Ember, SafeGet) {

  'use strict';

  exports['default'] = Ember['default'].Object.extend(SafeGet['default'], {
    numPagesToShow: 10,
    showFL: false,
    currentPage: null,
    totalPages: null,

    isValidPage: function isValidPage(page) {
      page = parseInt(page);
      var totalPages = this.getInt('totalPages');

      return page > 0 && page <= totalPages;
    },

    pagesToShow: (function () {
      var res = [];

      var numPages = this.getInt('numPagesToShow');
      var currentPage = this.getInt('currentPage');
      var totalPages = this.getInt('totalPages');
      var showFL = this.get('showFL');

      var before = parseInt(numPages / 2);
      if (currentPage - before < 1) {
        before = currentPage - 1;
      }
      var after = numPages - before - 1;
      if (totalPages - currentPage < after) {
        after = totalPages - currentPage;
        before = numPages - after - 1;
      }

      // add one page if no first or last is added
      if (showFL) {
        if (currentPage - before < 2) {
          after++;
        }
        if (totalPages - currentPage - 1 < after) {
          before++;
        }
      }

      // add each prior page
      for (var i = before; i > 0; i--) {
        var possiblePage = currentPage - i;
        if (this.isValidPage(possiblePage)) {
          res.push(possiblePage);
        }
      }

      res.push(currentPage);

      // add each following page
      for (i = 1; i <= after; i++) {
        var possiblePage2 = currentPage + i;
        if (this.isValidPage(possiblePage2)) {
          res.push(possiblePage2);
        }
      }

      // add first and last page
      if (showFL) {
        if (res.length > 0) {

          // add first page if not already there
          if (res[0] !== 1) {
            res = [1].concat(res);
          }

          // add last page if not already there
          if (res[res.length - 1] !== totalPages) {
            res.push(totalPages);
          }
        }
      }

      return res;
    }).property("numPagesToShow", "currentPage", "totalPages")
  });

});
define('ember-cli-pagination/local/controller-local-mixin', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	exports['default'] = Ember['default'].Mixin.create({});

});
define('ember-cli-pagination/local/paged-array', ['exports', 'ember', 'ember-cli-pagination/util', 'ember-cli-pagination/divide-into-pages', 'ember-cli-pagination/watch/lock-to-range'], function (exports, Ember, Util, DivideIntoPages, LockToRange) {

  'use strict';

  exports['default'] = Ember['default'].ArrayProxy.extend(Ember['default'].Evented, {
    page: 1,
    perPage: 10,

    divideObj: function divideObj() {
      return DivideIntoPages['default'].create({
        perPage: this.get('perPage'),
        all: this.get('content')
      });
    },

    arrangedContent: (function () {
      return this.divideObj().objsForPage(this.get('page'));
    }).property("content.[]", "page", "perPage"),

    totalPages: (function () {
      return this.divideObj().totalPages();
    }).property("content.[]", "perPage"),

    setPage: function setPage(page) {
      Util['default'].log("setPage " + page);
      return this.set('page', page);
    },

    watchPage: (function () {
      var page = this.get('page');
      var totalPages = this.get('totalPages');

      this.trigger('pageChanged', page);

      if (page < 1 || page > totalPages) {
        this.trigger('invalidPage', { page: page, totalPages: totalPages, array: this });
      }
    }).observes('page', 'totalPages'),

    then: function then(success, failure) {
      var content = this.get('content');
      var me = this;

      if (content.then) {
        content.then(function () {
          success(me);
        }, failure);
      } else {
        success(this);
      }
    },

    lockToRange: function lockToRange() {
      LockToRange['default'].watch(this);
    }
  });

});
define('ember-cli-pagination/local/route-local-mixin', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Mixin.create({
    findPaged: function findPaged(name) {
      return this.store.find(name);
    }
  });

});
define('ember-cli-pagination/page-mixin', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Mixin.create({
    getPage: function getPage() {
      return parseInt(this.get('page') || 1);
    },

    getPerPage: function getPerPage() {
      return parseInt(this.get('perPage'));
    }
  });

});
define('ember-cli-pagination/remote/controller-mixin', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Mixin.create({
    queryParams: ["page", "perPage"],

    pageBinding: "content.page",

    totalPagesBinding: "content.totalPages",

    pagedContentBinding: "content"
  });

});
define('ember-cli-pagination/remote/mapping', ['exports', 'ember', 'ember-cli-pagination/validate', 'ember-cli-pagination/util'], function (exports, Ember, Validate, Util) {

  'use strict';

  var QueryParamsForBackend = Ember['default'].Object.extend({
    defaultKeyFor: function defaultKeyFor(key) {
      if (key === 'perPage') {
        return 'per_page';
      }
      return null;
    },

    paramKeyFor: function paramKeyFor(key) {
      return this.getSuppliedParamMapping(key) || this.defaultKeyFor(key) || key;
    },

    getSuppliedParamMapping: function getSuppliedParamMapping(key) {
      var h = this.get('paramMapping') || {};
      return h[key];
    },

    accumParams: function accumParams(key, accum) {
      var val = this.get(key);
      var mappedKey = this.paramKeyFor(key);

      if (Array.isArray(mappedKey)) {
        this.accumParamsComplex(key, mappedKey, accum);
      } else {
        accum[mappedKey] = val;
      }
    },

    accumParamsComplex: function accumParamsComplex(key, mapArr, accum) {
      var mappedKey = mapArr[0];
      var mapFunc = mapArr[1];

      var val = mapFunc({ page: this.get('page'), perPage: this.get('perPage') });
      accum[mappedKey] = val;
    },

    make: function make() {
      var res = {};

      this.accumParams('page', res);
      this.accumParams('perPage', res);

      return res;
    }
  });

  var ChangeMeta = Ember['default'].Object.extend({
    getSuppliedParamMapping: function getSuppliedParamMapping(targetVal) {
      var h = this.get('paramMapping') || {};

      // have to do this gross thing because mapping looks like this:
      // {total_pages: ['num_pages',function() ...]}
      //
      // but the way the code works, we need to check for an entry where val[0] == num_pages
      // and then return ['total_pages',function() ...]
      //
      // Gross, but that's how it's working for now
      for (var key in h) {
        var val = h[key];
        if (targetVal === val) {
          return key;
        } else if (Array.isArray(val) && val[0] === targetVal) {
          return [key, val[1]];
        }
      }

      return null;
    },

    finalKeyFor: function finalKeyFor(key) {
      return this.getSuppliedParamMapping(key) || key;
    },

    makeSingleComplex: function makeSingleComplex(key, mapArr, rawVal, accum) {
      var mappedKey = mapArr[0];
      var mapFunc = mapArr[1];

      var ops = { rawVal: rawVal, page: this.get('page'), perPage: this.get('perPage') };
      var mappedVal = mapFunc(ops);
      accum[mappedKey] = mappedVal;
    },

    make: function make() {
      var res = {};
      var meta = this.get('meta');

      for (var key in meta) {
        var mappedKey = this.finalKeyFor(key);
        var val = meta[key];

        if (Array.isArray(mappedKey)) {
          this.makeSingleComplex(key, mappedKey, val, res);
        } else {
          res[mappedKey] = val;
        }
      }

      this.validate(res);

      return res;
    },

    validate: function validate(meta) {
      if (Util['default'].isBlank(meta.total_pages)) {
        Validate['default'].internalError("no total_pages in meta response", meta);
      }
    }
  });

  exports.QueryParamsForBackend = QueryParamsForBackend;
  exports.ChangeMeta = ChangeMeta;

});
define('ember-cli-pagination/remote/paged-remote-array', ['exports', 'ember', 'ember-cli-pagination/util', 'ember-cli-pagination/watch/lock-to-range', 'ember-cli-pagination/remote/mapping', 'ember-cli-pagination/page-mixin'], function (exports, Ember, Util, LockToRange, mapping, PageMixin) {

  'use strict';

  var ArrayProxyPromiseMixin = Ember['default'].Mixin.create(Ember['default'].PromiseProxyMixin, {
    then: function then(success, failure) {
      var promise = this.get('promise');
      var me = this;

      promise.then(function () {
        success(me);
      }, failure);
    }
  });

  exports['default'] = Ember['default'].ArrayProxy.extend(PageMixin['default'], Ember['default'].Evented, ArrayProxyPromiseMixin, {
    page: 1,
    paramMapping: (function () {
      return {};
    }).property(''),

    init: function init() {
      var initCallback = this.get('initCallback');
      if (initCallback) {
        initCallback(this);
      }

      try {
        this.get('promise');
      } catch (e) {
        this.set('promise', this.fetchContent());
      }
    },

    addParamMapping: function addParamMapping(key, mappedKey, mappingFunc) {
      var paramMapping = this.get('paramMapping') || {};
      if (mappingFunc) {
        paramMapping[key] = [mappedKey, mappingFunc];
      } else {
        paramMapping[key] = mappedKey;
      }
      this.set('paramMapping', paramMapping);
      this.incrementProperty('paramsForBackendCounter');
      //this.pageChanged();
    },

    addQueryParamMapping: function addQueryParamMapping(key, mappedKey, mappingFunc) {
      return this.addParamMapping(key, mappedKey, mappingFunc);
    },

    addMetaResponseMapping: function addMetaResponseMapping(key, mappedKey, mappingFunc) {
      return this.addParamMapping(key, mappedKey, mappingFunc);
    },

    paramsForBackend: (function () {
      var paramsObj = mapping.QueryParamsForBackend.create({ page: this.getPage(),
        perPage: this.getPerPage(),
        paramMapping: this.get('paramMapping') });
      var ops = paramsObj.make();

      // take the otherParams hash and add the values at the same level as page/perPage
      ops = Util['default'].mergeHashes(ops, this.get('otherParams') || {});

      return ops;
    }).property('page', 'perPage', 'paramMapping', 'paramsForBackendCounter'),

    rawFindFromStore: function rawFindFromStore() {
      var store = this.get('store');
      var modelName = this.get('modelName');

      var ops = this.get('paramsForBackend');
      var res = store.query(modelName, ops);

      return res;
    },

    fetchContent: function fetchContent() {
      var res = this.rawFindFromStore();
      this.incrementProperty("numRemoteCalls");
      var me = this;

      res.then(function (rows) {
        var metaObj = mapping.ChangeMeta.create({ paramMapping: me.get('paramMapping'),
          meta: rows.meta,
          page: me.getPage(),
          perPage: me.getPerPage() });

        return me.set("meta", metaObj.make());
      }, function (error) {
        Util['default'].log("PagedRemoteArray#fetchContent error " + error);
      });

      return res;
    },

    totalPagesBinding: "meta.total_pages",

    pageChanged: (function () {
      this.set("promise", this.fetchContent());
    }).observes("page", "perPage"),

    lockToRange: function lockToRange() {
      LockToRange['default'].watch(this);
    },

    watchPage: (function () {
      var page = this.get('page');
      var totalPages = this.get('totalPages');
      if (parseInt(totalPages) <= 0) {
        return;
      }

      this.trigger('pageChanged', page);

      if (page < 1 || page > totalPages) {
        this.trigger('invalidPage', { page: page, totalPages: totalPages, array: this });
      }
    }).observes('page', 'totalPages'),

    setOtherParam: function setOtherParam(k, v) {
      if (!this.get('otherParams')) {
        this.set('otherParams', {});
      }

      this.get('otherParams')[k] = v;
      this.incrementProperty('paramsForBackendCounter');
      Ember['default'].run.once(this, "pageChanged");
    }
  });

});
define('ember-cli-pagination/remote/route-mixin', ['exports', 'ember', 'ember-cli-pagination/remote/paged-remote-array', 'ember-cli-pagination/util'], function (exports, Ember, PagedRemoteArray, Util) {

  'use strict';

  exports['default'] = Ember['default'].Mixin.create({
    perPage: 10,
    startingPage: 1,

    model: function model(params) {
      return this.findPaged(this._findModelName(this.get('routeName')), params);
    },

    _findModelName: function _findModelName(routeName) {
      return Ember['default'].String.singularize(Ember['default'].String.camelize(routeName));
    },

    findPaged: function findPaged(name, params, callback) {
      var mainOps = {
        page: params.page || this.get('startingPage'),
        perPage: params.perPage || this.get('perPage'),
        modelName: name,
        store: this.store
      };

      if (params.paramMapping) {
        mainOps.paramMapping = params.paramMapping;
      }

      var otherOps = Util['default'].paramsOtherThan(params, ["page", "perPage", "paramMapping"]);
      mainOps.otherParams = otherOps;

      mainOps.initCallback = callback;

      return PagedRemoteArray['default'].create(mainOps);
    }
  });

});
define('ember-cli-pagination/test-helpers', ['exports', 'ember', 'ember-cli-pagination/divide-into-pages'], function (exports, Ember, DivideIntoPages) {

  'use strict';

  var TestHelpers = Ember['default'].Object.extend({
    responseHash: function responseHash() {
      var page = this.pageFromRequest(this.request);
      var k = "" + this.name + "s";

      var res = {};
      res[k] = this.objsForPage(page);
      res.meta = { total_pages: this.totalPages() };

      return res;
    },

    divideObj: function divideObj() {
      var perPage = this.perPageFromRequest(this.request);
      return DivideIntoPages['default'].create({ perPage: perPage, all: this.all });
    },

    objsForPage: function objsForPage(page) {
      return this.divideObj().objsForPage(page);
    },

    pageFromRequest: function pageFromRequest(request) {
      var res = request.queryParams.page;
      return parseInt(res);
    },

    perPageFromRequest: function perPageFromRequest(request) {
      var res = request.queryParams.per_page;
      return parseInt(res);
    },

    totalPages: function totalPages() {
      return this.divideObj().totalPages();
    }
  });

  TestHelpers.reopenClass({
    responseHash: function responseHash(request, all, name) {
      return this.create({
        request: request,
        all: all,
        name: name
      }).responseHash();
    }
  });

  exports['default'] = TestHelpers;

});
define('ember-cli-pagination/util/safe-get', ['exports', 'ember', 'ember-cli-pagination/validate', 'ember-cli-pagination/util'], function (exports, Ember, Validate, Util) {

  'use strict';

  exports['default'] = Ember['default'].Mixin.create({
    getInt: function getInt(prop) {
      var raw = this.get(prop);
      if (raw === 0 || raw === "0") {
        // do nothing
      } else if (Util['default'].isBlank(raw)) {
          Validate['default'].internalError("no int for " + prop + " val is " + raw);
        }
      return parseInt(raw);
    }
  });

});
define('ember-cli-pagination/util', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  var Util = Ember['default'].Object.extend();

  Util.reopenClass({
    log: function log() {},

    isBlank: function isBlank(obj) {
      if (obj === 0) {
        return false;
      }
      return !obj || obj === "";
    },

    keysOtherThan: function keysOtherThan(params, excludeKeys) {
      var res = [];
      for (var key in params) {
        if (!excludeKeys.contains(key)) {
          res.push(key);
        }
      }
      return res;
    },

    paramsOtherThan: function paramsOtherThan(params, excludeKeys) {
      var res = {};
      var keys = this.keysOtherThan(params, excludeKeys);
      for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        var val = params[key];
        res[key] = val;
      }
      return res;
    },

    mergeHashes: function mergeHashes(a, b) {
      var res = {};
      var val;
      var key;

      for (key in a) {
        val = a[key];
        res[key] = val;
      }

      for (key in b) {
        val = b[key];
        res[key] = val;
      }

      return res;
    },

    isFunction: function isFunction(obj) {
      return typeof obj === 'function';
    },

    getHashKeyForValue: function getHashKeyForValue(hash, targetVal) {
      for (var k in hash) {
        var val = hash[k];
        if (val === targetVal) {
          return k;
        } else if (Util.isFunction(targetVal) && targetVal(val)) {
          return k;
        }
      }
      return undefined;
    }
  });

  exports['default'] = Util;

});
define('ember-cli-pagination/validate', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  var Validate = Ember['default'].Object.extend();

  Validate.reopenClass({
    internalErrors: [],

    internalError: function internalError(str, obj) {
      this.internalErrors.push(str);
      Ember['default'].Logger.warn(str);
      if (obj) {
        Ember['default'].Logger.warn(obj);
      }
    },

    getLastInternalError: function getLastInternalError() {
      return this.internalErrors[this.internalErrors.length - 1];
    }
  });

  exports['default'] = Validate;

});
define('ember-cli-pagination/watch/lock-to-range', ['exports'], function (exports) {

  'use strict';

  exports['default'] = {
    watch: function watch(paged) {
      paged.on('invalidPage', function (event) {
        if (event.page < 1) {
          paged.set('page', 1);
        } else if (event.page > event.totalPages) {
          paged.set('page', event.totalPages);
        }
      });
    }
  };

});
define('ember-cli-pagination', ['ember-cli-pagination/index', 'ember', 'exports'], function(__index__, __Ember__, __exports__) {
  'use strict';
  var keys = Object.keys || __Ember__['default'].keys;
  var forEach = Array.prototype.forEach && function(array, cb) {
    array.forEach(cb);
  } || __Ember__['default'].EnumerableUtils.forEach;

  forEach(keys(__index__), (function(key) {
    __exports__[key] = __index__[key];
  }));
});

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
define('ember-ic-you', ['ember-ic-you/index', 'ember', 'exports'], function(__index__, __Ember__, __exports__) {
  'use strict';
  var keys = Object.keys || __Ember__['default'].keys;
  var forEach = Array.prototype.forEach && function(array, cb) {
    array.forEach(cb);
  } || __Ember__['default'].EnumerableUtils.forEach;

  forEach(keys(__index__), (function(key) {
    __exports__[key] = __index__[key];
  }));
});

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
define('ember-infinity/mixins/route', ['exports', 'ember', 'ember-version-is'], function (exports, Ember, ember_version_is) {

  'use strict';

  var keys = Object.keys || Ember['default'].keys;
  /**
    The Ember Infinity Route Mixin enables an application route to load paginated
    records for the route `model` as triggered by the controller (or Infinity Loader
    component).

    @class RouteMixin
    @namespace EmberInfinity
    @module ember-infinity/mixins/route
    @extends Ember.Mixin
  */
  exports['default'] = Ember['default'].Mixin.create({

    /**
      @private
      @property _perPage
      @type Integer
      @default 25
    */
    _perPage: 25,

    /**
      @private
      @property currentPage
      @type Integer
      @default 0
    */
    currentPage: 0,

    /**
      @private
      @property _extraParams
      @type Object
      @default {}
    */
    _extraParams: {},

    /**
      @private
      @property _boundParams
      @type Object
      @default {}
    */
    _boundParams: {},

    /**
      @private
      @property _loadingMore
      @type Boolean
      @default false
    */
    _loadingMore: false,

    /**
      @private
      @property _totalPages
      @type Integer
      @default 0
    */
    _totalPages: 0,

    /**
      @private
      @property _infinityModelName
      @type String
      @default null
    */
    _infinityModelName: null,

    /**
      @private
      @property _modelPath
      @type String
      @default 'controller.model'
    */
    _modelPath: 'controller.model',

    /**
     * Name of the "per page" param in the
     * resource request payload
     * @type {String}
     * @default  "per_page"
     */
    perPageParam: 'per_page',

    /**
     * Name of the "page" param in the
     * resource request payload
     * @type {String}
     * @default "page"
     */
    pageParam: 'page',

    /**
     * Path of the "total pages" param in
     * the HTTP response
     * @type {String}
     * @default "meta.total_pages"
     */
    totalPagesParam: 'meta.total_pages',

    /**
     * The supported findMethod name for
     * the developers Ember Data version.
     * Provided here for backwards compat.
     * @type {String}
     * @default "query"
     */
    _storeFindMethod: 'query',

    /**
      @private
      @property _canLoadMore
      @type Boolean
      @default false
    */
    _canLoadMore: Ember['default'].computed('_totalPages', 'currentPage', function () {
      var totalPages = this.get('_totalPages');
      var currentPage = this.get('currentPage');
      return totalPages && currentPage ? currentPage < totalPages : false;
    }),

    /**
      Use the infinityModel method in the place of `this.store.find('model')` to
      initialize the Infinity Model for your route.
       @method infinityModel
      @param {String} modelName The name of the model.
      @param {Object} options Optional, the perPage and startingPage to load from.
      @param {Object} boundParams Optional, any route properties to be included as additional params.
      @return {Ember.RSVP.Promise}
    */
    infinityModel: function infinityModel(modelName, options, boundParams) {
      var _this = this;

      if (ember_version_is.emberDataVersionIs('greaterThan', '1.0.0-beta.19.2') && ember_version_is.emberDataVersionIs('lessThan', '1.13.4')) {
        throw new Ember['default'].Error("Ember Infinity: You are using an unsupported version of Ember Data.  Please upgrade to at least 1.13.4 or downgrade to 1.0.0-beta.19.2");
      }

      if (ember_version_is.emberDataVersionIs('lessThan', '1.13.0')) {
        this.set('_storeFindMethod', 'find');
      }

      if (Ember['default'].isEmpty(this.store) || Ember['default'].isEmpty(this.store[this._storeFindMethod])) {
        throw new Ember['default'].Error("Ember Infinity: Ember Data store is not available to infinityModel");
      } else if (modelName === undefined) {
        throw new Ember['default'].Error("Ember Infinity: You must pass a Model Name to infinityModel");
      }

      this.set('_infinityModelName', modelName);

      options = options ? Ember['default'].merge({}, options) : {};
      var startingPage = options.startingPage || 1;
      var perPage = options.perPage || this.get('_perPage');
      var modelPath = options.modelPath || this.get('_modelPath');

      delete options.startingPage;
      delete options.perPage;
      delete options.modelPath;

      this.set('_perPage', perPage);
      this.set('_modelPath', modelPath);
      this.set('_extraParams', options);

      var requestPayloadBase = {};
      requestPayloadBase[this.get('perPageParam')] = perPage;
      requestPayloadBase[this.get('pageParam')] = startingPage;

      if (typeof boundParams === 'object') {
        this.set('_boundParams', boundParams);
        options = this._includeBoundParams(options, boundParams);
      }

      var params = Ember['default'].merge(requestPayloadBase, options);
      var promise = this.store[this._storeFindMethod](modelName, params);

      promise.then(function (infinityModel) {
        var totalPages = infinityModel.get(_this.get('totalPagesParam'));
        _this.set('currentPage', startingPage);
        _this.set('_totalPages', totalPages);
        infinityModel.set('reachedInfinity', !_this.get('_canLoadMore'));
        if (_this.infinityModelUpdated) {
          Ember['default'].run.scheduleOnce('afterRender', _this, 'infinityModelUpdated', {
            lastPageLoaded: startingPage,
            totalPages: totalPages,
            newObjects: infinityModel
          });
        }
      }, function () {
        throw new Ember['default'].Error("Ember Infinity: Could not fetch Infinity Model. Please check your serverside configuration.");
      });

      return promise;
    },

    /**
     Trigger a load of the next page of results.
      @method infinityLoad
     @return {Boolean}
     */
    _infinityLoad: function _infinityLoad() {
      var _this2 = this;

      var nextPage = this.get('currentPage') + 1;
      var perPage = this.get('_perPage');
      var totalPages = this.get('_totalPages');
      var modelName = this.get('_infinityModelName');
      var options = this.get('_extraParams');
      var boundParams = this.get('_boundParams');

      if (!this.get('_loadingMore') && this.get('_canLoadMore')) {
        this.set('_loadingMore', true);

        var requestPayloadBase = {};
        requestPayloadBase[this.get('perPageParam')] = perPage;
        requestPayloadBase[this.get('pageParam')] = nextPage;

        options = this._includeBoundParams(options, boundParams);
        var params = Ember['default'].merge(requestPayloadBase, this.get('_extraParams'));

        var promise = this.store[this._storeFindMethod](modelName, params);

        promise.then(function (newObjects) {

          _this2.updateInfinityModel(newObjects);
          _this2.set('_loadingMore', false);
          _this2.set('currentPage', nextPage);
          if (_this2.infinityModelUpdated) {
            Ember['default'].run.scheduleOnce('afterRender', _this2, 'infinityModelUpdated', {
              lastPageLoaded: nextPage,
              totalPages: totalPages,
              newObjects: newObjects
            });
          }
          if (!_this2.get('_canLoadMore')) {
            _this2.set(_this2.get('_modelPath') + '.reachedInfinity', true);
            if (_this2.infinityModelLoaded) {
              Ember['default'].run.scheduleOnce('afterRender', _this2, 'infinityModelLoaded', {
                totalPages: totalPages
              });
            }
          }
        }, function () {
          _this2.set('_loadingMore', false);
          throw new Ember['default'].Error("Ember Infinity: Could not fetch Infinity Model. Please check your serverside configuration.");
        });
      } else {
        if (!this.get('_canLoadMore')) {
          this.set(this.get('_modelPath') + '.reachedInfinity', true);
          if (this.infinityModelLoaded) {
            Ember['default'].run.scheduleOnce('afterRender', this, 'infinityModelLoaded', { totalPages: totalPages });
          }
        }
      }
      return false;
    },

    /**
     include any bound params into the options object.
      @method includeBoundParams
     @param {Object} options, the object to include bound params into.
     @param {Object} boundParams, an object of properties to be included into options.
     @return {Object}
     */
    _includeBoundParams: function _includeBoundParams(options, boundParams) {
      var _this3 = this;

      if (!Ember['default'].isEmpty(boundParams)) {
        keys(boundParams).forEach(function (k) {
          return options[k] = _this3.get(boundParams[k]);
        });
      }

      return options;
    },

    /**
     Update the infinity model with new objects
      @method updateInfinityModel
     @param {Ember.Enumerable} newObjects The new objects to add to the model
     @return {Ember.Array} returns the updated infinity model
     */
    updateInfinityModel: function updateInfinityModel(newObjects) {
      var infinityModel = this.get(this.get('_modelPath'));

      return infinityModel.pushObjects(newObjects.get('content'));
    },

    actions: {
      infinityLoad: function infinityLoad() {
        this._infinityLoad();
      }
    }
  });

});
define('ember-infinity', ['ember-infinity/index', 'ember', 'exports'], function(__index__, __Ember__, __exports__) {
  'use strict';
  var keys = Object.keys || __Ember__['default'].keys;
  var forEach = Array.prototype.forEach && function(array, cb) {
    array.forEach(cb);
  } || __Ember__['default'].EnumerableUtils.forEach;

  forEach(keys(__index__), (function(key) {
    __exports__[key] = __index__[key];
  }));
});

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
define('ember-new-computed/utils/can-use-new-syntax', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  var supportsSetterGetter;

  try {
    Ember['default'].computed({
      set: function set() {},
      get: function get() {}
    });
    supportsSetterGetter = true;
  } catch (e) {
    supportsSetterGetter = false;
  }

  exports['default'] = supportsSetterGetter;

});
define('ember-new-computed', ['ember-new-computed/index', 'ember', 'exports'], function(__index__, __Ember__, __exports__) {
  'use strict';
  var keys = Object.keys || __Ember__['default'].keys;
  var forEach = Array.prototype.forEach && function(array, cb) {
    array.forEach(cb);
  } || __Ember__['default'].EnumerableUtils.forEach;

  forEach(keys(__index__), (function(key) {
    __exports__[key] = __index__[key];
  }));
});

define('ember-version-is/index', ['exports', 'ember', 'ember-data'], function (exports, Ember, DS) {

  'use strict';

  /*global semver*/
  var is = function is(value, operation, version) {
    if (arguments.length === 2 || Ember['default'].isNone(version)) {
      Ember['default'].assert('range must be a valid semver range', semver.validRange(operation));
      return semver.satisfies(value, operation);
    }

    switch (operation) {
      case 'equalTo':
        return semver.eq(value, version);
      case 'greaterThan':
        return semver.gt(value, version);
      case 'greaterThanOrEqualTo':
        return semver.gte(value, version);
      case 'lessThan':
        return semver.lt(value, version);
      case 'lessThanOrEqualTo':
        return semver.lte(value, version);
      default:
        throw new Error("Ember Version Is: Please pass either 'equalTo', 'lessThan', 'lessThanOrEqualTo', 'greaterThan' or 'greatThanOrEqualTo' as the operation argument.");
    }
  };

  var emberVersionIs = function emberVersionIs(operation, value) {
    return is(Ember['default'].VERSION, operation, value);
  };

  var emberDataVersionIs = function emberDataVersionIs(operation, value) {
    return is(DS['default'].VERSION, operation, value);
  };

  exports['default'] = emberVersionIs;

  exports.is = is;
  exports.emberVersionIs = emberVersionIs;
  exports.emberDataVersionIs = emberDataVersionIs;

});
define('ember-version-is', ['ember-version-is/index', 'ember', 'exports'], function(__index__, __Ember__, __exports__) {
  'use strict';
  var keys = Object.keys || __Ember__['default'].keys;
  var forEach = Array.prototype.forEach && function(array, cb) {
    array.forEach(cb);
  } || __Ember__['default'].EnumerableUtils.forEach;

  forEach(keys(__index__), (function(key) {
    __exports__[key] = __index__[key];
  }));
});

define('simple-auth-token/authenticators/jwt', ['exports', 'ember', 'simple-auth-token/configuration', 'simple-auth-token/authenticators/token'], function (exports, Ember, Configuration, TokenAuthenticator) {

  'use strict';

  exports['default'] = TokenAuthenticator['default'].extend({
    /**
      The endpoint on the server for refreshing a token.
      @property serverTokenRefreshEndpoint
      @type String
      @default '/api-token-refresh/'
    */
    serverTokenRefreshEndpoint: '/api-token-refresh/',

    /**
      Sets whether the authenticator automatically refreshes access tokens.
      @property refreshAccessTokens
      @type Boolean
      @default true
    */
    refreshAccessTokens: true,

    /**
      The number of seconds to subtract from the token's time of expiration when
      scheduling the automatic token refresh call.
      @property refreshLeeway
      @type Integer
      @default 0 (seconds)
    */
    refreshLeeway: 0,

    /**
      The amount of time to wait before refreshing the token - set automatically.
      @property refreshTokenTimeout
      @private
    */
    refreshTokenTimeout: null,

    /**
      The name for which decoded token field represents the token expire time.
      @property tokenExpireName
      @type String
      @default 'exp'
    */
    tokenExpireName: 'exp',

    /**
      Default time unit.
      @property timeFactor
      @type Integer
      @default 1 (seconds)
    */
    timeFactor: 1,

    /**
      @method init
      @private
    */
    init: function init() {
      this.serverTokenEndpoint = Configuration['default'].serverTokenEndpoint;
      this.serverTokenRefreshEndpoint = Configuration['default'].serverTokenRefreshEndpoint;
      this.identificationField = Configuration['default'].identificationField;
      this.tokenPropertyName = Configuration['default'].tokenPropertyName;
      this.refreshAccessTokens = Configuration['default'].refreshAccessTokens;
      this.refreshLeeway = Configuration['default'].refreshLeeway;
      this.tokenExpireName = Configuration['default'].tokenExpireName;
      this.timeFactor = Configuration['default'].timeFactor;
      this.headers = Configuration['default'].headers;
    },

    /**
      Restores the session from a set of session properties.
       It will return a resolving promise if one of two conditions is met:
       1) Both `data.token` and `data.expiresAt` are non-empty and `expiresAt`
         is greater than the calculated `now`.
      2) If `data.token` is non-empty and the decoded token has a key for
         `tokenExpireName`.
       If `refreshAccessTokens` is true, `scheduleAccessTokenRefresh` will
      be called and an automatic token refresh will be initiated.
       @method restore
      @param {Object} data The data to restore the session from
      @return {Ember.RSVP.Promise} A promise that when it resolves results
                                   in the session being authenticated
    */
    restore: function restore(data) {
      var _this = this,
          dataObject = Ember['default'].Object.create(data);

      return new Ember['default'].RSVP.Promise(function (resolve, reject) {
        var now = new Date().getTime();
        var expiresAt = _this.resolveTime(dataObject.get(_this.tokenExpireName));
        var token = dataObject.get(_this.tokenPropertyName);

        if (Ember['default'].isEmpty(token)) {
          return reject(new Error('empty token'));
        }
        if (Ember['default'].isEmpty(expiresAt)) {
          // Fetch the expire time from the token data since `expiresAt`
          // wasn't included in the data object that was passed in.
          var tokenData = _this.getTokenData(data[_this.tokenPropertyName]);
          expiresAt = _this.resolveTime(tokenData[_this.tokenExpireName]);
          if (Ember['default'].isEmpty(expiresAt)) {
            return resolve(data);
          }
        }
        if (expiresAt !== expiresAt) {
          return reject(new Error('invalid expiration'));
        }
        if (expiresAt > now) {
          var wait = expiresAt - now - _this.refreshLeeway * 1000;
          if (wait > 0) {
            if (_this.refreshAccessTokens) {
              _this.scheduleAccessTokenRefresh(dataObject.get(_this.tokenExpireName), token);
            }
            resolve(data);
          } else if (_this.refreshAccessTokens) {
            resolve(_this.refreshAccessToken(token).then(function () {
              return data;
            }));
          } else {
            reject(new Error('unable to refresh token'));
          }
        } else {
          reject(new Error('token is expired'));
        }
      });
    },

    /**
      Authenticates the session with the specified `credentials`.
       It will return a resolving promise if it successfully posts a request
      to the `JWT.serverTokenEndpoint` with the valid credentials.
       An automatic token refresh will be scheduled with the new expiration date
      from the returned refresh token. That expiration will be merged with the
      response and the promise resolved.
       @method authenticate
      @param {Object} options The credentials to authenticate the session with
      @return {Ember.RSVP.Promise} A promise that resolves when an auth token is
                                   successfully acquired from the server and rejects
                                   otherwise
    */
    authenticate: function authenticate(credentials) {
      var _this = this;

      return new Ember['default'].RSVP.Promise(function (resolve, reject) {
        var data = _this.getAuthenticateData(credentials);

        _this.makeRequest(_this.serverTokenEndpoint, data).then(function (response) {
          Ember['default'].run(function () {
            var token = response[_this.tokenPropertyName],
                tokenData = _this.getTokenData(token),
                expiresAt = tokenData[_this.tokenExpireName],
                tokenExpireData = {};

            _this.scheduleAccessTokenRefresh(expiresAt, token);

            tokenExpireData[_this.tokenExpireName] = expiresAt;

            response = Ember['default'].merge(response, tokenExpireData);

            resolve(_this.getResponseData(response));
          });
        }, function (xhr) {
          Ember['default'].run(function () {
            reject(xhr.responseJSON || xhr.responseText);
          });
        });
      });
    },

    /**
      Schedules a token refresh request to be sent to the backend after a calculated
      `wait` time has passed.
       If both `token` and `expiresAt` are non-empty, and `expiresAt` minus the optional
      refres leeway is greater than the calculated `now`, the token refresh will be scheduled
      through Ember.run.later.
       @method scheduleAccessTokenRefresh
      @private
    */
    scheduleAccessTokenRefresh: function scheduleAccessTokenRefresh(expiresAt, token) {
      if (this.refreshAccessTokens) {
        expiresAt = this.resolveTime(expiresAt);

        var now = new Date().getTime(),
            wait = expiresAt - now - this.refreshLeeway * 1000;

        if (!Ember['default'].isEmpty(token) && !Ember['default'].isEmpty(expiresAt) && wait > 0) {
          Ember['default'].run.cancel(this._refreshTokenTimeout);

          delete this._refreshTokenTimeout;

          if (!Ember['default'].testing) {
            this._refreshTokenTimeout = Ember['default'].run.later(this, this.refreshAccessToken, token, wait);
          }
        }
      }
    },

    /**
      Makes a refresh token request to grab a new authenticated JWT token from the server.
       It will return a resolving promise if a successful POST is made to the
      `JWT.serverTokenRefreshEndpoint`.
       After the new token is obtained it will schedule the next automatic token refresh
      based on the new `expiresAt` time.
       The session will be updated via the trigger `sessionDataUpdated`.
       @method refreshAccessToken
      @private
    */
    refreshAccessToken: function refreshAccessToken(token) {
      var _this = this,
          data = {};

      data[_this.tokenPropertyName] = token;

      return new Ember['default'].RSVP.Promise(function (resolve, reject) {
        _this.makeRequest(_this.serverTokenRefreshEndpoint, data).then(function (response) {
          Ember['default'].run(function () {
            var token = response[_this.tokenPropertyName],
                tokenData = _this.getTokenData(token),
                expiresAt = tokenData[_this.tokenExpireName],
                tokenExpireData = {};

            tokenExpireData[_this.tokenExpireName] = expiresAt;

            data = Ember['default'].merge(response, tokenExpireData);

            _this.scheduleAccessTokenRefresh(expiresAt, token);
            _this.trigger('sessionDataUpdated', data);

            resolve(response);
          });
        }, function (xhr, status, error) {
          Ember['default'].Logger.warn('Access token could not be refreshed - server responded with ' + error + '.');
          reject();
        });
      });
    },

    /**
      Returns the decoded token with accessible returned values.
       @method getTokenData
      @return {object} An object with properties for the session.
    */
    getTokenData: function getTokenData(token) {
      var tokenData = atob(token.split('.')[1]);

      try {
        return JSON.parse(tokenData);
      } catch (e) {
        //jshint unused:false
        return tokenData;
      }
    },

    /**
      Accepts a `url` and `data` to be used in an ajax server request.
       @method makeRequest
      @private
    */
    makeRequest: function makeRequest(url, data) {
      return Ember['default'].$.ajax({
        url: url,
        method: 'POST',
        data: JSON.stringify(data),
        dataType: 'json',
        contentType: 'application/json',
        beforeSend: function beforeSend(xhr, settings) {
          xhr.setRequestHeader('Accept', settings.accepts.json);
        },
        headers: this.headers
      });
    },

    /**
      Cancels any outstanding automatic token refreshes and returns a resolving
      promise.
      @method invalidate
      @param {Object} data The data of the session to be invalidated
      @return {Ember.RSVP.Promise} A resolving promise
    */
    invalidate: function invalidate() {
      Ember['default'].run.cancel(this._refreshTokenTimeout);

      delete this._refreshTokenTimeout;

      return new Ember['default'].RSVP.resolve();
    },

    /**
      Handles converting between time units for data between different systems.
      Default: seconds(1)
      @method resolveTime
      @private
    */
    resolveTime: function resolveTime(time) {
      if (Ember['default'].isEmpty(time)) {
        return time;
      }
      return new Date(time * this.timeFactor).getTime();
    }
  });

});
define('simple-auth-token/authenticators/token', ['exports', 'ember', 'simple-auth/authenticators/base', 'simple-auth-token/configuration'], function (exports, Ember, Base, Configuration) {

  'use strict';

  exports['default'] = Base['default'].extend({
    /**
      The endpoint on the server the authenticator acquires the auth token from.
       This value can be configured via
      [`SimpleAuth.Configuration.Token#serverTokenEndpoint`](#SimpleAuth-Configuration-Token-serverTokenEndpoint).
       @property serverTokenEndpoint
      @type String
      @default '/api-token-auth/'
    */
    serverTokenEndpoint: '/api-token-auth/',

    /**
      The attribute-name that is used for the identification field when sending the
      authentication data to the server.
       This value can be configured via
      [`SimpleAuth.Configuration.Token#identificationField`](#SimpleAuth-Configuration-Token-identificationField).
       @property identificationField
      @type String
      @default 'username'
    */
    identificationField: 'username',

    /**
      The attribute-name that is used for the password field when sending the
      authentication data to the server.
       This value can be configured via
      [`SimpleAuth.Configuration.Token#passwordfield`](#SimpleAuth-Configuration-Token-passwordfield).
       @property passwordField
      @type String
      @default 'password'
    */
    passwordField: 'password',

    /**
      The name of the property in session that contains token used for authorization.
       This value can be configured via
      [`SimpleAuth.Configuration.Token#tokenPropertyName`](#SimpleAuth-Configuration-Token-tokenPropertyName).
       @property tokenPropertyName
      @type String
      @default 'token'
    */
    tokenPropertyName: 'token',

    /**
      The property that stores custom headers that will be sent on every request.
       This value can be configured via
      [`SimpleAuth.Configuration.Token#headers`](#SimpleAuth-Configuration-Token-headers).
       @property headers
      @type Object
      @default {}
    */
    headers: {},

    /**
      @method init
      @private
    */
    init: function init() {
      this.serverTokenEndpoint = Configuration['default'].serverTokenEndpoint;
      this.identificationField = Configuration['default'].identificationField;
      this.passwordField = Configuration['default'].passwordField;
      this.tokenPropertyName = Configuration['default'].tokenPropertyName;
      this.headers = Configuration['default'].headers;
    },

    /**
      Restores the session from a set of session properties; __will return a
      resolving promise when there's a non-empty `token` in the
      `properties`__ and a rejecting promise otherwise.
       @method restore
      @param {Object} properties The properties to restore the session from
      @return {Ember.RSVP.Promise} A promise that when it resolves results in the session being authenticated
    */
    restore: function restore(properties) {
      var _this = this,
          propertiesObject = Ember['default'].Object.create(properties);

      return new Ember['default'].RSVP.Promise(function (resolve, reject) {
        if (!Ember['default'].isEmpty(propertiesObject.get(_this.tokenPropertyName))) {
          resolve(properties);
        } else {
          reject();
        }
      });
    },

    /**
      Authenticates the session with the specified `credentials`; the credentials
      are `POST`ed to the
      [`Authenticators.Token#serverTokenEndpoint`](#SimpleAuth-Authenticators-Token-serverTokenEndpoint)
      and if they are valid the server returns an auth token in
      response. __If the credentials are valid and authentication succeeds, a
      promise that resolves with the server's response is returned__, otherwise a
      promise that rejects with the server error is returned.
       @method authenticate
      @param {Object} options The credentials to authenticate the session with
      @return {Ember.RSVP.Promise} A promise that resolves when an auth token is successfully acquired from the server and rejects otherwise
    */
    authenticate: function authenticate(credentials) {
      var _this = this;
      return new Ember['default'].RSVP.Promise(function (resolve, reject) {
        var data = _this.getAuthenticateData(credentials);
        _this.makeRequest(data).then(function (response) {
          Ember['default'].run(function () {
            resolve(_this.getResponseData(response));
          });
        }, function (xhr) {
          Ember['default'].run(function () {
            reject(xhr.responseJSON || xhr.responseText);
          });
        });
      });
    },

    /**
      Returns an object used to be sent for authentication.
       @method getAuthenticateData
      @return {object} An object with properties for authentication.
    */
    getAuthenticateData: function getAuthenticateData(credentials) {
      var authentication = {};
      authentication[this.passwordField] = credentials.password;
      authentication[this.identificationField] = credentials.identification;
      return authentication;
    },

    /**
      Returns an object with properties the `authenticate` promise will resolve,
      be saved in and accessible via the session.
       @method getResponseData
      @return {object} An object with properties for the session.
    */
    getResponseData: function getResponseData(response) {
      return response;
    },

    /**
      Does nothing
       @method invalidate
      @return {Ember.RSVP.Promise} A resolving promise
    */
    invalidate: function invalidate() {
      return Ember['default'].RSVP.resolve();
    },

    /**
      @method makeRequest
      @private
    */
    makeRequest: function makeRequest(data) {
      return Ember['default'].$.ajax({
        url: this.serverTokenEndpoint,
        method: 'POST',
        data: JSON.stringify(data),
        dataType: 'json',
        contentType: 'application/json',
        beforeSend: function beforeSend(xhr, settings) {
          xhr.setRequestHeader('Accept', settings.accepts.json);
        },
        headers: this.headers
      });
    }
  });

});
define('simple-auth-token/authorizers/token', ['exports', 'ember', 'simple-auth/authorizers/base', 'simple-auth-token/configuration'], function (exports, Ember, Base, Configuration) {

  'use strict';

  exports['default'] = Base['default'].extend({
    /**
      The prefix used in the value of the Authorization header.
       This value can be configured via
      [`SimpleAuth.Configuration.Token#authorizationPrefix`](#SimpleAuth-Configuration-Token-authorizationPrefix).
       @property authorizationPrefix
      @type String
      @default 'Bearer '
    */
    authorizationPrefix: 'Bearer ',

    /**
      The name of the property in session that contains token used for authorization.
       This value can be configured via
      [`SimpleAuth.Configuration.Token#tokenPropertyName`](#SimpleAuth-Configuration-Token-tokenPropertyName).
       @property tokenPropertyName
      @type String
      @default 'token'
    */
    tokenPropertyName: 'token',

    /**
      The name of the HTTP Header used to send token.
       This value can be configured via
      [`SimpleAuth.Configuration.Token#authorizationHeaderName`](#SimpleAuth-Configuration-Token-authorizationHeaderName).
       @property authorizationHeaderName
      @type String
      @default 'Authorization'
    */
    authorizationHeaderName: 'Authorization',

    /**
      @method init
      @private
    */
    init: function init() {
      this.tokenPropertyName = Configuration['default'].tokenPropertyName;
      this.authorizationHeaderName = Configuration['default'].authorizationHeaderName;

      if (Configuration['default'].authorizationPrefix || Configuration['default'].authorizationPrefix === null) {
        this.authorizationPrefix = Configuration['default'].authorizationPrefix;
      }
    },

    /**
      Authorizes an XHR request by sending the `token`
      properties from the session in the `Authorization` header:
       ```
      Authorization: Bearer <token>
      ```
       @method authorize
      @param {jqXHR} jqXHR The XHR request to authorize (see http://api.jquery.com/jQuery.ajax/#jqXHR)
    */
    authorize: function authorize(jqXHR) {
      var token = this.buildToken();

      if (this.get('session.isAuthenticated') && !Ember['default'].isEmpty(token)) {
        if (this.authorizationPrefix) {
          token = this.authorizationPrefix + token;
        }

        jqXHR.setRequestHeader(this.authorizationHeaderName, token);
      }
    },

    /**
      Builds the token string. It can be overriden for inclusion of quotes.
       @method buildToken
      @return {String}
    */
    buildToken: function buildToken() {
      return this.get('session.secure.' + this.tokenPropertyName);
    }
  });

});
define('simple-auth-token/configuration', ['exports', 'simple-auth-token/utils/load-config'], function (exports, loadConfig) {

  'use strict';

  var defaults = {
    serverTokenEndpoint: '/api-token-auth/',
    serverTokenRefreshEndpoint: '/api-token-refresh/',
    identificationField: 'username',
    passwordField: 'password',
    tokenPropertyName: 'token',
    refreshAccessTokens: true,
    refreshLeeway: 0,
    tokenExpireName: 'exp',
    authorizationPrefix: 'Bearer ',
    authorizationHeaderName: 'Authorization',
    timeFactor: 1,
    headers: {}
  };

  /**
    Ember Simple Auth Token's configuration object.

    To change any of these values, set them on the application's
    environment object:

    ```js
    ENV['simple-auth-token'] = {
      serverTokenEndpoint: '/some/other/endpoint'
    }
    ```

    @class Token
    @namespace SimpleAuth.Configuration
    @module simple-auth/configuration
  */
  exports['default'] = {
    /**
      The endpoint on the server the authenticator acquires the auth token
      and email from.
       @property serverTokenEndpoint
      @readOnly
      @static
      @type String
      @default '/users/sign_in'
    */
    serverTokenEndpoint: defaults.serverTokenEndpoint,

    /**
      The endpoint on the server where the authenticator refreshes a token.
      @property serverTokenRefreshEndpoint
      @type String
      @default '/api-token-refresh/'
    */
    serverTokenRefreshEndpoint: defaults.serverTokenRefreshEndpoint,

    /**
      The attribute-name that is used for the identification field when sending
      the authentication data to the server.
       @property identificationField
      @readOnly
      @static
      @type String
      @default 'username'
    */
    identificationField: defaults.identificationField,

    /**
      The attribute-name that is used for the password field when sending
      the authentication data to the server.
       @property passwordField
      @readOnly
      @static
      @type String
      @default 'password'
    */
    passwordField: defaults.passwordField,

    /**
      The name of the property in session that contains token
      used for authorization.
       @property tokenPropertyName
      @readOnly
      @static
      @type String
      @default 'token'
    */
    tokenPropertyName: defaults.tokenPropertyName,

    /**
      Sets whether the authenticator automatically refreshes access tokens.
      @property refreshAccessTokens
      @type Boolean
      @default true
    */
    refreshAccessTokens: defaults.refreshAccessTokens,

    /**
      The number of seconds to subtract from the token's time of expiration when
      scheduling the automatic token refresh call.
      @property refreshLeeway
      @type Integer
      @default 0 (seconds)
    */
    refreshLeeway: defaults.refreshLeeway,

    /**
      The name for which decoded token field represents the token expire time.
      @property tokenExpireName
      @type String
      @default 'exp'
    */
    tokenExpireName: defaults.tokenExpireName,

    /**
      Default time unit.
      @property timeFactor
      @type Integer
      @default 1 (seconds)
    */
    timeFactor: 1,

    /**
      The prefix used in the value of the Authorization header.
       @property authorizationPrefix
      @readOnly
      @static
      @type String
      @default 'Bearer '
    */
    authorizationPrefix: defaults.authorizationPrefix,

    /**
      The name of the HTTP Header used to send token.
       @property authorizationHeaderName
      @readOnly
      @static
      @type String
      @default 'Authorization'
    */
    authorizationHeaderName: defaults.authorizationHeaderName,

    /**
      Custom headers to be added on request.
       @property headers
      @readonly
      @static
      @type Object
      @default {}
    */
    headers: defaults.headers,

    /**
      @method load
      @private
    */
    load: loadConfig['default'](defaults)
  };

});
define('simple-auth-token/utils/load-config', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = function (defaults, callback) {
    return function (container, config) {
      var wrappedConfig = Ember['default'].Object.create(config);
      for (var property in this) {
        if (this.hasOwnProperty(property) && Ember['default'].typeOf(this[property]) !== 'function') {
          this[property] = wrappedConfig.getWithDefault(property, defaults[property]);
        }
      }
      if (callback) {
        callback.apply(this, [container, config]);
      }
    };
  }

});
define('simple-auth-token', ['simple-auth-token/index', 'ember', 'exports'], function(__index__, __Ember__, __exports__) {
  'use strict';
  var keys = Object.keys || __Ember__['default'].keys;
  var forEach = Array.prototype.forEach && function(array, cb) {
    array.forEach(cb);
  } || __Ember__['default'].EnumerableUtils.forEach;

  forEach(keys(__index__), (function(key) {
    __exports__[key] = __index__[key];
  }));
});
//# sourceMappingURL=addons.map