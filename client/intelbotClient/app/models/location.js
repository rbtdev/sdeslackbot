import DS from 'ember-data';

export default DS.Model.extend({
	name: DS.attr('string'),
	area: DS.attr('string'),
	intelUrl: DS.attr('string'),
	mapsUrl: DS.attr('string'),
	shortCode: DS.attr('string'),
	author: DS.belongsTo('user', {async: true})
});