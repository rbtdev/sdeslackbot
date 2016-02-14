import Ember from 'ember';
import DivideIntoPages from './divide-into-pages';

var TestHelpers = Ember.Object.extend({
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
    return DivideIntoPages.create({ perPage: perPage, all: this.all });
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

export default TestHelpers;