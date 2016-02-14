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