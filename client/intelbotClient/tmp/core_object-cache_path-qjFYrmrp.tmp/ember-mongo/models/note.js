define('ember-mongo/models/note', ['exports', 'ember-data'], function (exports, DS) {

	'use strict';

	exports['default'] = DS['default'].Model.extend({
		title: DS['default'].attr('string'),
		content: DS['default'].attr('string'),
		author: DS['default'].belongsTo('user', { async: true })
	});

});