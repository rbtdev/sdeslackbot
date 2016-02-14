import DS from 'ember-data';
import Ember from 'ember';

export default DS.Model.extend({
  title: DS.attr('string'),
  image: DS.attr(),
  imageUrl: Ember.computed.alias('image.url'),
  imageName: DS.attr(),
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

    if (Ember.isPresent(url) && Ember.isNone(imageName)) {
      return url.split('/').find(function (urlPart) {
        return !!urlPart.match(/\.(?:jpg|gif|png)$/) ? urlPart : null;
      });
    } else {
      return "";
    }
  }).observes('imageUrl'),
  progress: 0
});