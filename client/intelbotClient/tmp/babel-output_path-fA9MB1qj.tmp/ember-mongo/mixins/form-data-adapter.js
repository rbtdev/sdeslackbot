import Ember from 'ember';
import DS from 'ember-data';

var InvalidError = DS.InvalidError;

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
  },

  ajax: function ajax(url, type, options) {
    var adapter = this;

    return new Ember.RSVP.Promise(function (resolve, reject) {
      var hash = adapter.ajaxOptions(url, type, options);

      hash.success = function (payload, textStatus, jqXHR) {
        var response = undefined;

        response = adapter.handleResponse(jqXHR.status, jqXHR.getAllResponseHeaders(), payload);

        if (response instanceof InvalidError) {
          Ember.run(null, reject, response);
        } else {
          Ember.run(null, resolve, response);
        }
      };

      hash.error = function (jqXHR, textStatus, errorThrown) {
        var error = undefined;
        error = adapter.handleResponse(jqXHR.status, jqXHR.getAllResponseHeaders(), adapter.parseErrorResponse(jqXHR.responseText));
        Ember.run(null, reject, error);
      };

      hash.xhr = function () {
        var xhr = new window.XMLHttpRequest();
        //Upload progress
        xhr.upload.addEventListener("progress", function (evt) {
          if (evt.lengthComputable) {
            var percentComplete = evt.loaded / evt.total;
            Ember.$('[data-uploader]').trigger({
              type: "uploadProgress",
              progress: percentComplete
            });
          }
        }, false);
        //Download progress
        xhr.addEventListener("progress", function (evt) {
          if (evt.lengthComputable) {
            var percentComplete = evt.loaded / evt.total;
            Ember.$('[data-uploader]').trigger({
              type: "downloadProgress",
              progress: percentComplete
            });
          }
        }, false);
        return xhr;
      };

      Ember.$.ajax(hash);
    }, "DS: RESTAdapter#ajax " + type + " to " + url);
  }
});