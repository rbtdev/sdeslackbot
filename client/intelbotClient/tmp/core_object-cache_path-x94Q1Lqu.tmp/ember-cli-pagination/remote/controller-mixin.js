define('ember-cli-pagination/remote/controller-mixin', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Mixin.create({
    queryParams: ["page", "perPage"],

    pageBinding: "content.page",

    totalPagesBinding: "content.totalPages",

    pagedContentBinding: "content"
  });

});