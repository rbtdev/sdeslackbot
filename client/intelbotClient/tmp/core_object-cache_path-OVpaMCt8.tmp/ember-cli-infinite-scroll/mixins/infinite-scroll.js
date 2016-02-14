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