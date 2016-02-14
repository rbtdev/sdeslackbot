define('ember-mongo/models/file', ['exports', 'ember-data', 'ember'], function (exports, DS, Ember) {

  'use strict';

  exports['default'] = DS['default'].Model.extend({
    title: DS['default'].attr('string'),
    image: DS['default'].attr(),
    imageUrl: Ember['default'].computed.alias('image.url'),
    imageName: DS['default'].attr(),
    progress: 0
  });

});