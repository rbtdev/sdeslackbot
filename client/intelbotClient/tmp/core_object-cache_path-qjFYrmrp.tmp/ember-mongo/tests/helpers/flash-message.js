define('ember-mongo/tests/helpers/flash-message', ['ember-cli-flash/flash/object'], function (FlashObject) {

	'use strict';

	FlashObject['default'].reopen({ _setInitialState: null });

});