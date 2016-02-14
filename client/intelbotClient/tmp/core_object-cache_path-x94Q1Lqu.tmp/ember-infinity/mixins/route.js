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