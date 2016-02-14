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