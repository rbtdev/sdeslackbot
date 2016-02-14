import Ember from 'ember';

export default Ember.Mixin.create({
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
      root = Ember.keys(data)[0];

      Ember.keys(data[root]).forEach(function (key) {
        if (Ember.isPresent(data[root][key])) {
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