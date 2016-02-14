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