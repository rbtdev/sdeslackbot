export { initialize };
import config from '../config/environment';

function initialize() {
  var application = arguments[1] || arguments[0];
  var flashMessageDefaults = config.flashMessageDefaults;
  var injectionFactories = flashMessageDefaults.injectionFactories;

  application.register('config:flash-messages', flashMessageDefaults, { instantiate: false });
  application.inject('service:flash-messages', 'flashMessageDefaults', 'config:flash-messages');

  injectionFactories.forEach(function (factory) {
    application.inject(factory, 'flashMessages', 'service:flash-messages');
  });
}

export default {
  name: 'flash-messages',
  initialize: initialize
};