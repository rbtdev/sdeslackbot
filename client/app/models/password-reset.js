import DS from 'ember-data';  
import Ember from 'ember';

export default DS.Model.extend({  
  pwResetKey: DS.attr('string'),
  newPw: DS.attr('string')
});