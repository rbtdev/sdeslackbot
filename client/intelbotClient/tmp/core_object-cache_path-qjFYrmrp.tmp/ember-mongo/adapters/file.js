define('ember-mongo/adapters/file', ['exports', 'ember-mongo/adapters/application', 'ember-mongo/mixins/form-data-adapter'], function (exports, ApplicationAdapter, FormDataAdapterMixin) {

	'use strict';

	exports['default'] = ApplicationAdapter['default'].extend(FormDataAdapterMixin['default'], {});

});