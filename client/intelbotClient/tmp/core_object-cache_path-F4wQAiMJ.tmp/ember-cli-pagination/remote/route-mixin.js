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