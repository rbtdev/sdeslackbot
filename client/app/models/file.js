import DS from 'ember-data';  
import Ember from 'ember';

export default DS.Model.extend({  
  title: DS.attr('string'),
  file: DS.attr(),
  fileUrl: Ember.computed.alias('file.url'),
  fileName: DS.attr(),
  progress: 0
});