import DS from 'ember-data';  
import Ember from 'ember';

export default DS.Model.extend({  
  title: DS.attr('string'),
  image: DS.attr(),
  imageUrl: Ember.computed.alias('image.url'),
  imageName: DS.attr(),
  progress: 0
});