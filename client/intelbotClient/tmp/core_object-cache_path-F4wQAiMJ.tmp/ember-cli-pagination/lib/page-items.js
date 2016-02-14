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