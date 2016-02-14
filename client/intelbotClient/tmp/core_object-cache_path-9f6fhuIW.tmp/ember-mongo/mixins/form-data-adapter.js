define('ember-mongo/mixins/form-data-adapter', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Mixin.create({
    // Overwrite to change the request types on which Form Data is sent
    formDataTypes: ['POST', 'PUT', 'PATCH'],

    ajaxOptions: function ajaxOptions(url, type, options) {
      var data;

      if (options && 'data' in options) {
        data = options.data;
      }

      var hash = this._super.apply(this, arguments);

      if (typeof FormData === 'function' && data && this.formDataTypes.contains(type)) {
        var formData, root;

        formData = new FormData();
        root = Ember['default'].keys(data)[0];

        Ember['default'].keys(data[root]).forEach(function (key) {
          if (Ember['default'].isPresent(data[root][key])) {
            formData.append(root + "[" + key + "]", data[root][key]);
          }
        });

        hash.processData = false;
        hash.contentType = false;
        hash.data = formData;
      }

      return hash;
    }
  });

});