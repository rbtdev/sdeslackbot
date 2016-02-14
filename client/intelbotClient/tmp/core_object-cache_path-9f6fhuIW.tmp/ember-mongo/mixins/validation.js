define('ember-mongo/mixins/validation', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Mixin.create({
    validators: Ember['default'].inject.service(),
    init: function init() {
      var properties, validations, _this;

      this._super.apply(this, arguments);

      properties = Ember['default'].keys(this.get('validations'));
      validations = this.get('validations');
      _this = this;

      properties.forEach(function (property) {
        var modelProperty, validationsToExecute;

        modelProperty = validations[property];
        validationsToExecute = Ember['default'].keys(modelProperty);

        validationsToExecute.forEach(function (validation) {
          var validationToExecute, validator;

          validationToExecute = validations[property][validation];
          validator = _this.get('validators').findBy('name', validation);

          _this.addObserver(property, _this, function (model) {
            validator.get('executor').execute(model, property, validationToExecute);
          });
        });
      });
    }

  });

});