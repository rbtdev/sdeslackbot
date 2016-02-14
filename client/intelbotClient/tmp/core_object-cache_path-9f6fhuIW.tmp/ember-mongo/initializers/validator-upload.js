define('ember-mongo/initializers/validator-upload', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports.initialize = initialize;

  var UploadValidator = Ember['default'].Object.create({
    execute: function execute(model, property, restrictions) {
      var isValid, acceptedExtensions;

      isValid = false;
      acceptedExtensions = new RegExp("\\.(?:" + restrictions.accept.join('|') + ")$");

      isValid = !!model.get(property).toLocaleLowerCase().match(acceptedExtensions);

      if (!isValid) {
        model.get('errors').add(property, restrictions.message);
      }
    }
  });

  function initialize(container) {
    var validators = container.lookup('service:validators');
    validators.pushObject(Ember['default'].Object.create({
      name: 'file',
      executor: UploadValidator
    }));
  }

  exports['default'] = {
    name: 'validator-upload',
    initialize: initialize
  };

});