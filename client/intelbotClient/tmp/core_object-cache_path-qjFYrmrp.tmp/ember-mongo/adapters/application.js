define('ember-mongo/adapters/application', ['exports', 'ember-data', 'ember-mongo/config/environment'], function (exports, DS, ENV) {

	'use strict';

	exports['default'] = DS['default'].RESTAdapter.extend({
		namespace: ENV['default'].api.apiNameSpace,
		host: ENV['default'].api.apiHost
	});

});