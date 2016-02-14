define('ember-mongo/models/file', ['exports', 'ember-data', 'ember'], function (exports, DS, Ember) {

  'use strict';

  exports['default'] = DS['default'].Model.extend({
    title: DS['default'].attr('string'),
    image: DS['default'].attr(),
    imageUrl: Ember['default'].computed.alias('image.url'),
    imageName: DS['default'].attr(),
    imageNameObserver: (function () {
      /*
        This computed property is simply to when we receive the file from our
        servers on a store.find('asset', id) query we are still able to isolate
        it's file name correctly.
        If you api returns the imageName on the response you do not need this observer
      */
      var url, imageName;

      url = this.get('fileUrl');
      imageName = this.get('imageName');

      if (Ember['default'].isPresent(url) && Ember['default'].isNone(imageName)) {
        return url.split('/').find(function (urlPart) {
          return !!urlPart.match(/\.(?:jpg|gif|png)$/) ? urlPart : null;
        });
      } else {
        return "";
      }
    }).observes('imageUrl'),
    progress: 0
  });

});