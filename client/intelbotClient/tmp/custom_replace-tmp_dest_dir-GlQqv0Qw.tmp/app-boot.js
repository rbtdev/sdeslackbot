/* jshint ignore:start */

define('ember-mongo/config/environment', ['ember'], function(Ember) {
  var prefix = 'ember-mongo';
/* jshint ignore:start */

try {
  var metaName = prefix + '/config/environment';
  var rawConfig = Ember['default'].$('meta[name="' + metaName + '"]').attr('content');
  var config = JSON.parse(unescape(rawConfig));

  return { 'default': config };
}
catch(err) {
  throw new Error('Could not read config from meta tag with name "' + metaName + '".');
}

/* jshint ignore:end */

});

if (runningTests) {
  require("ember-mongo/tests/test-helper");
} else {
  require("ember-mongo/app")["default"].create({"name":"ember-mongo","version":"0.0.0+33258cb1"});
}

/* jshint ignore:end */
