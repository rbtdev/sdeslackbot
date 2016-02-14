define('ember-cli-app-version/components/app-version', ['exports', 'ember', 'ember-cli-app-version/templates/app-version'], function (exports, Ember, layout) {

  'use strict';

  exports['default'] = Ember['default'].Component.extend({
    tagName: 'span',
    layout: layout['default']
  });

});
define('ember-cli-app-version/initializer-factory', ['exports', 'ember'], function (exports, Ember) {

  'use strict';



  exports['default'] = initializerFactory;
  var classify = Ember['default'].String.classify;

  function initializerFactory(name, version) {
    var registered = false;

    return function () {
      if (!registered && name && version) {
        var appName = classify(name);
        Ember['default'].libraries.register(appName, version);
        registered = true;
      }
    };
  }

});
define('ember-cli-app-version/templates/app-version', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      meta: {
        "revision": "Ember@1.13.7",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 2,
            "column": 0
          }
        },
        "moduleName": "modules/ember-cli-app-version/templates/app-version.hbs"
      },
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var morphs = new Array(1);
        morphs[0] = dom.createMorphAt(fragment,0,0,contextualElement);
        dom.insertBoundary(fragment, 0);
        return morphs;
      },
      statements: [
        ["content","version",["loc",[null,[1,0],[1,11]]]]
      ],
      locals: [],
      templates: []
    };
  }()));

});
define('ember-cli-app-version', ['ember-cli-app-version/index', 'ember', 'exports'], function(__index__, __Ember__, __exports__) {
  'use strict';
  var keys = Object.keys || __Ember__['default'].keys;
  var forEach = Array.prototype.forEach && function(array, cb) {
    array.forEach(cb);
  } || __Ember__['default'].EnumerableUtils.forEach;

  forEach(keys(__index__), (function(key) {
    __exports__[key] = __index__[key];
  }));
});

define('ember-cli-content-security-policy', ['ember-cli-content-security-policy/index', 'ember', 'exports'], function(__index__, __Ember__, __exports__) {
  'use strict';
  var keys = Object.keys || __Ember__['default'].keys;
  var forEach = Array.prototype.forEach && function(array, cb) {
    array.forEach(cb);
  } || __Ember__['default'].EnumerableUtils.forEach;

  forEach(keys(__index__), (function(key) {
    __exports__[key] = __index__[key];
  }));
});

define('simple-auth-token/authenticators/jwt', ['exports', 'ember', 'simple-auth-token/configuration', 'simple-auth-token/authenticators/token'], function (exports, Ember, Configuration, TokenAuthenticator) {

  'use strict';

  exports['default'] = TokenAuthenticator['default'].extend({
    /**
      The endpoint on the server for refreshing a token.
      @property serverTokenRefreshEndpoint
      @type String
      @default '/api-token-refresh/'
    */
    serverTokenRefreshEndpoint: '/api-token-refresh/',

    /**
      Sets whether the authenticator automatically refreshes access tokens.
      @property refreshAccessTokens
      @type Boolean
      @default true
    */
    refreshAccessTokens: true,

    /**
      The number of seconds to subtract from the token's time of expiration when
      scheduling the automatic token refresh call.
      @property refreshLeeway
      @type Integer
      @default 0 (seconds)
    */
    refreshLeeway: 0,

    /**
      The amount of time to wait before refreshing the token - set automatically.
      @property refreshTokenTimeout
      @private
    */
    refreshTokenTimeout: null,

    /**
      The name for which decoded token field represents the token expire time.
      @property tokenExpireName
      @type String
      @default 'exp'
    */
    tokenExpireName: 'exp',

    /**
      Default time unit.
      @property timeFactor
      @type Integer
      @default 1 (seconds)
    */
    timeFactor: 1,

    /**
      @method init
      @private
    */
    init: function init() {
      this.serverTokenEndpoint = Configuration['default'].serverTokenEndpoint;
      this.serverTokenRefreshEndpoint = Configuration['default'].serverTokenRefreshEndpoint;
      this.identificationField = Configuration['default'].identificationField;
      this.tokenPropertyName = Configuration['default'].tokenPropertyName;
      this.refreshAccessTokens = Configuration['default'].refreshAccessTokens;
      this.refreshLeeway = Configuration['default'].refreshLeeway;
      this.tokenExpireName = Configuration['default'].tokenExpireName;
      this.timeFactor = Configuration['default'].timeFactor;
      this.headers = Configuration['default'].headers;
    },

    /**
      Restores the session from a set of session properties.
       It will return a resolving promise if one of two conditions is met:
       1) Both `data.token` and `data.expiresAt` are non-empty and `expiresAt`
         is greater than the calculated `now`.
      2) If `data.token` is non-empty and the decoded token has a key for
         `tokenExpireName`.
       If `refreshAccessTokens` is true, `scheduleAccessTokenRefresh` will
      be called and an automatic token refresh will be initiated.
       @method restore
      @param {Object} data The data to restore the session from
      @return {Ember.RSVP.Promise} A promise that when it resolves results
                                   in the session being authenticated
    */
    restore: function restore(data) {
      var _this = this,
          dataObject = Ember['default'].Object.create(data);

      return new Ember['default'].RSVP.Promise(function (resolve, reject) {
        var now = new Date().getTime();
        var expiresAt = _this.resolveTime(dataObject.get(_this.tokenExpireName));
        var token = dataObject.get(_this.tokenPropertyName);

        if (Ember['default'].isEmpty(token)) {
          return reject(new Error('empty token'));
        }
        if (Ember['default'].isEmpty(expiresAt)) {
          // Fetch the expire time from the token data since `expiresAt`
          // wasn't included in the data object that was passed in.
          var tokenData = _this.getTokenData(data[_this.tokenPropertyName]);
          expiresAt = _this.resolveTime(tokenData[_this.tokenExpireName]);
          if (Ember['default'].isEmpty(expiresAt)) {
            return resolve(data);
          }
        }
        if (expiresAt !== expiresAt) {
          return reject(new Error('invalid expiration'));
        }
        if (expiresAt > now) {
          var wait = expiresAt - now - _this.refreshLeeway * 1000;
          if (wait > 0) {
            if (_this.refreshAccessTokens) {
              _this.scheduleAccessTokenRefresh(dataObject.get(_this.tokenExpireName), token);
            }
            resolve(data);
          } else if (_this.refreshAccessTokens) {
            resolve(_this.refreshAccessToken(token).then(function () {
              return data;
            }));
          } else {
            reject(new Error('unable to refresh token'));
          }
        } else {
          reject(new Error('token is expired'));
        }
      });
    },

    /**
      Authenticates the session with the specified `credentials`.
       It will return a resolving promise if it successfully posts a request
      to the `JWT.serverTokenEndpoint` with the valid credentials.
       An automatic token refresh will be scheduled with the new expiration date
      from the returned refresh token. That expiration will be merged with the
      response and the promise resolved.
       @method authenticate
      @param {Object} options The credentials to authenticate the session with
      @return {Ember.RSVP.Promise} A promise that resolves when an auth token is
                                   successfully acquired from the server and rejects
                                   otherwise
    */
    authenticate: function authenticate(credentials) {
      var _this = this;

      return new Ember['default'].RSVP.Promise(function (resolve, reject) {
        var data = _this.getAuthenticateData(credentials);

        _this.makeRequest(_this.serverTokenEndpoint, data).then(function (response) {
          Ember['default'].run(function () {
            var token = response[_this.tokenPropertyName],
                tokenData = _this.getTokenData(token),
                expiresAt = tokenData[_this.tokenExpireName],
                tokenExpireData = {};

            _this.scheduleAccessTokenRefresh(expiresAt, token);

            tokenExpireData[_this.tokenExpireName] = expiresAt;

            response = Ember['default'].merge(response, tokenExpireData);

            resolve(_this.getResponseData(response));
          });
        }, function (xhr) {
          Ember['default'].run(function () {
            reject(xhr.responseJSON || xhr.responseText);
          });
        });
      });
    },

    /**
      Schedules a token refresh request to be sent to the backend after a calculated
      `wait` time has passed.
       If both `token` and `expiresAt` are non-empty, and `expiresAt` minus the optional
      refres leeway is greater than the calculated `now`, the token refresh will be scheduled
      through Ember.run.later.
       @method scheduleAccessTokenRefresh
      @private
    */
    scheduleAccessTokenRefresh: function scheduleAccessTokenRefresh(expiresAt, token) {
      if (this.refreshAccessTokens) {
        expiresAt = this.resolveTime(expiresAt);

        var now = new Date().getTime(),
            wait = expiresAt - now - this.refreshLeeway * 1000;

        if (!Ember['default'].isEmpty(token) && !Ember['default'].isEmpty(expiresAt) && wait > 0) {
          Ember['default'].run.cancel(this._refreshTokenTimeout);

          delete this._refreshTokenTimeout;

          if (!Ember['default'].testing) {
            this._refreshTokenTimeout = Ember['default'].run.later(this, this.refreshAccessToken, token, wait);
          }
        }
      }
    },

    /**
      Makes a refresh token request to grab a new authenticated JWT token from the server.
       It will return a resolving promise if a successful POST is made to the
      `JWT.serverTokenRefreshEndpoint`.
       After the new token is obtained it will schedule the next automatic token refresh
      based on the new `expiresAt` time.
       The session will be updated via the trigger `sessionDataUpdated`.
       @method refreshAccessToken
      @private
    */
    refreshAccessToken: function refreshAccessToken(token) {
      var _this = this,
          data = {};

      data[_this.tokenPropertyName] = token;

      return new Ember['default'].RSVP.Promise(function (resolve, reject) {
        _this.makeRequest(_this.serverTokenRefreshEndpoint, data).then(function (response) {
          Ember['default'].run(function () {
            var token = response[_this.tokenPropertyName],
                tokenData = _this.getTokenData(token),
                expiresAt = tokenData[_this.tokenExpireName],
                tokenExpireData = {};

            tokenExpireData[_this.tokenExpireName] = expiresAt;

            data = Ember['default'].merge(response, tokenExpireData);

            _this.scheduleAccessTokenRefresh(expiresAt, token);
            _this.trigger('sessionDataUpdated', data);

            resolve(response);
          });
        }, function (xhr, status, error) {
          Ember['default'].Logger.warn('Access token could not be refreshed - server responded with ' + error + '.');
          reject();
        });
      });
    },

    /**
      Returns the decoded token with accessible returned values.
       @method getTokenData
      @return {object} An object with properties for the session.
    */
    getTokenData: function getTokenData(token) {
      var tokenData = atob(token.split('.')[1]);

      try {
        return JSON.parse(tokenData);
      } catch (e) {
        //jshint unused:false
        return tokenData;
      }
    },

    /**
      Accepts a `url` and `data` to be used in an ajax server request.
       @method makeRequest
      @private
    */
    makeRequest: function makeRequest(url, data) {
      return Ember['default'].$.ajax({
        url: url,
        method: 'POST',
        data: JSON.stringify(data),
        dataType: 'json',
        contentType: 'application/json',
        beforeSend: function beforeSend(xhr, settings) {
          xhr.setRequestHeader('Accept', settings.accepts.json);
        },
        headers: this.headers
      });
    },

    /**
      Cancels any outstanding automatic token refreshes and returns a resolving
      promise.
      @method invalidate
      @param {Object} data The data of the session to be invalidated
      @return {Ember.RSVP.Promise} A resolving promise
    */
    invalidate: function invalidate() {
      Ember['default'].run.cancel(this._refreshTokenTimeout);

      delete this._refreshTokenTimeout;

      return new Ember['default'].RSVP.resolve();
    },

    /**
      Handles converting between time units for data between different systems.
      Default: seconds(1)
      @method resolveTime
      @private
    */
    resolveTime: function resolveTime(time) {
      if (Ember['default'].isEmpty(time)) {
        return time;
      }
      return new Date(time * this.timeFactor).getTime();
    }
  });

});
define('simple-auth-token/authenticators/token', ['exports', 'ember', 'simple-auth/authenticators/base', 'simple-auth-token/configuration'], function (exports, Ember, Base, Configuration) {

  'use strict';

  exports['default'] = Base['default'].extend({
    /**
      The endpoint on the server the authenticator acquires the auth token from.
       This value can be configured via
      [`SimpleAuth.Configuration.Token#serverTokenEndpoint`](#SimpleAuth-Configuration-Token-serverTokenEndpoint).
       @property serverTokenEndpoint
      @type String
      @default '/api-token-auth/'
    */
    serverTokenEndpoint: '/api-token-auth/',

    /**
      The attribute-name that is used for the identification field when sending the
      authentication data to the server.
       This value can be configured via
      [`SimpleAuth.Configuration.Token#identificationField`](#SimpleAuth-Configuration-Token-identificationField).
       @property identificationField
      @type String
      @default 'username'
    */
    identificationField: 'username',

    /**
      The attribute-name that is used for the password field when sending the
      authentication data to the server.
       This value can be configured via
      [`SimpleAuth.Configuration.Token#passwordfield`](#SimpleAuth-Configuration-Token-passwordfield).
       @property passwordField
      @type String
      @default 'password'
    */
    passwordField: 'password',

    /**
      The name of the property in session that contains token used for authorization.
       This value can be configured via
      [`SimpleAuth.Configuration.Token#tokenPropertyName`](#SimpleAuth-Configuration-Token-tokenPropertyName).
       @property tokenPropertyName
      @type String
      @default 'token'
    */
    tokenPropertyName: 'token',

    /**
      The property that stores custom headers that will be sent on every request.
       This value can be configured via
      [`SimpleAuth.Configuration.Token#headers`](#SimpleAuth-Configuration-Token-headers).
       @property headers
      @type Object
      @default {}
    */
    headers: {},

    /**
      @method init
      @private
    */
    init: function init() {
      this.serverTokenEndpoint = Configuration['default'].serverTokenEndpoint;
      this.identificationField = Configuration['default'].identificationField;
      this.passwordField = Configuration['default'].passwordField;
      this.tokenPropertyName = Configuration['default'].tokenPropertyName;
      this.headers = Configuration['default'].headers;
    },

    /**
      Restores the session from a set of session properties; __will return a
      resolving promise when there's a non-empty `token` in the
      `properties`__ and a rejecting promise otherwise.
       @method restore
      @param {Object} properties The properties to restore the session from
      @return {Ember.RSVP.Promise} A promise that when it resolves results in the session being authenticated
    */
    restore: function restore(properties) {
      var _this = this,
          propertiesObject = Ember['default'].Object.create(properties);

      return new Ember['default'].RSVP.Promise(function (resolve, reject) {
        if (!Ember['default'].isEmpty(propertiesObject.get(_this.tokenPropertyName))) {
          resolve(properties);
        } else {
          reject();
        }
      });
    },

    /**
      Authenticates the session with the specified `credentials`; the credentials
      are `POST`ed to the
      [`Authenticators.Token#serverTokenEndpoint`](#SimpleAuth-Authenticators-Token-serverTokenEndpoint)
      and if they are valid the server returns an auth token in
      response. __If the credentials are valid and authentication succeeds, a
      promise that resolves with the server's response is returned__, otherwise a
      promise that rejects with the server error is returned.
       @method authenticate
      @param {Object} options The credentials to authenticate the session with
      @return {Ember.RSVP.Promise} A promise that resolves when an auth token is successfully acquired from the server and rejects otherwise
    */
    authenticate: function authenticate(credentials) {
      var _this = this;
      return new Ember['default'].RSVP.Promise(function (resolve, reject) {
        var data = _this.getAuthenticateData(credentials);
        _this.makeRequest(data).then(function (response) {
          Ember['default'].run(function () {
            resolve(_this.getResponseData(response));
          });
        }, function (xhr) {
          Ember['default'].run(function () {
            reject(xhr.responseJSON || xhr.responseText);
          });
        });
      });
    },

    /**
      Returns an object used to be sent for authentication.
       @method getAuthenticateData
      @return {object} An object with properties for authentication.
    */
    getAuthenticateData: function getAuthenticateData(credentials) {
      var authentication = {};
      authentication[this.passwordField] = credentials.password;
      authentication[this.identificationField] = credentials.identification;
      return authentication;
    },

    /**
      Returns an object with properties the `authenticate` promise will resolve,
      be saved in and accessible via the session.
       @method getResponseData
      @return {object} An object with properties for the session.
    */
    getResponseData: function getResponseData(response) {
      return response;
    },

    /**
      Does nothing
       @method invalidate
      @return {Ember.RSVP.Promise} A resolving promise
    */
    invalidate: function invalidate() {
      return Ember['default'].RSVP.resolve();
    },

    /**
      @method makeRequest
      @private
    */
    makeRequest: function makeRequest(data) {
      return Ember['default'].$.ajax({
        url: this.serverTokenEndpoint,
        method: 'POST',
        data: JSON.stringify(data),
        dataType: 'json',
        contentType: 'application/json',
        beforeSend: function beforeSend(xhr, settings) {
          xhr.setRequestHeader('Accept', settings.accepts.json);
        },
        headers: this.headers
      });
    }
  });

});
define('simple-auth-token/authorizers/token', ['exports', 'ember', 'simple-auth/authorizers/base', 'simple-auth-token/configuration'], function (exports, Ember, Base, Configuration) {

  'use strict';

  exports['default'] = Base['default'].extend({
    /**
      The prefix used in the value of the Authorization header.
       This value can be configured via
      [`SimpleAuth.Configuration.Token#authorizationPrefix`](#SimpleAuth-Configuration-Token-authorizationPrefix).
       @property authorizationPrefix
      @type String
      @default 'Bearer '
    */
    authorizationPrefix: 'Bearer ',

    /**
      The name of the property in session that contains token used for authorization.
       This value can be configured via
      [`SimpleAuth.Configuration.Token#tokenPropertyName`](#SimpleAuth-Configuration-Token-tokenPropertyName).
       @property tokenPropertyName
      @type String
      @default 'token'
    */
    tokenPropertyName: 'token',

    /**
      The name of the HTTP Header used to send token.
       This value can be configured via
      [`SimpleAuth.Configuration.Token#authorizationHeaderName`](#SimpleAuth-Configuration-Token-authorizationHeaderName).
       @property authorizationHeaderName
      @type String
      @default 'Authorization'
    */
    authorizationHeaderName: 'Authorization',

    /**
      @method init
      @private
    */
    init: function init() {
      this.tokenPropertyName = Configuration['default'].tokenPropertyName;
      this.authorizationHeaderName = Configuration['default'].authorizationHeaderName;

      if (Configuration['default'].authorizationPrefix || Configuration['default'].authorizationPrefix === null) {
        this.authorizationPrefix = Configuration['default'].authorizationPrefix;
      }
    },

    /**
      Authorizes an XHR request by sending the `token`
      properties from the session in the `Authorization` header:
       ```
      Authorization: Bearer <token>
      ```
       @method authorize
      @param {jqXHR} jqXHR The XHR request to authorize (see http://api.jquery.com/jQuery.ajax/#jqXHR)
    */
    authorize: function authorize(jqXHR) {
      var token = this.buildToken();

      if (this.get('session.isAuthenticated') && !Ember['default'].isEmpty(token)) {
        if (this.authorizationPrefix) {
          token = this.authorizationPrefix + token;
        }

        jqXHR.setRequestHeader(this.authorizationHeaderName, token);
      }
    },

    /**
      Builds the token string. It can be overriden for inclusion of quotes.
       @method buildToken
      @return {String}
    */
    buildToken: function buildToken() {
      return this.get('session.secure.' + this.tokenPropertyName);
    }
  });

});
define('simple-auth-token/configuration', ['exports', 'simple-auth-token/utils/load-config'], function (exports, loadConfig) {

  'use strict';

  var defaults = {
    serverTokenEndpoint: '/api-token-auth/',
    serverTokenRefreshEndpoint: '/api-token-refresh/',
    identificationField: 'username',
    passwordField: 'password',
    tokenPropertyName: 'token',
    refreshAccessTokens: true,
    refreshLeeway: 0,
    tokenExpireName: 'exp',
    authorizationPrefix: 'Bearer ',
    authorizationHeaderName: 'Authorization',
    timeFactor: 1,
    headers: {}
  };

  /**
    Ember Simple Auth Token's configuration object.

    To change any of these values, set them on the application's
    environment object:

    ```js
    ENV['simple-auth-token'] = {
      serverTokenEndpoint: '/some/other/endpoint'
    }
    ```

    @class Token
    @namespace SimpleAuth.Configuration
    @module simple-auth/configuration
  */
  exports['default'] = {
    /**
      The endpoint on the server the authenticator acquires the auth token
      and email from.
       @property serverTokenEndpoint
      @readOnly
      @static
      @type String
      @default '/users/sign_in'
    */
    serverTokenEndpoint: defaults.serverTokenEndpoint,

    /**
      The endpoint on the server where the authenticator refreshes a token.
      @property serverTokenRefreshEndpoint
      @type String
      @default '/api-token-refresh/'
    */
    serverTokenRefreshEndpoint: defaults.serverTokenRefreshEndpoint,

    /**
      The attribute-name that is used for the identification field when sending
      the authentication data to the server.
       @property identificationField
      @readOnly
      @static
      @type String
      @default 'username'
    */
    identificationField: defaults.identificationField,

    /**
      The attribute-name that is used for the password field when sending
      the authentication data to the server.
       @property passwordField
      @readOnly
      @static
      @type String
      @default 'password'
    */
    passwordField: defaults.passwordField,

    /**
      The name of the property in session that contains token
      used for authorization.
       @property tokenPropertyName
      @readOnly
      @static
      @type String
      @default 'token'
    */
    tokenPropertyName: defaults.tokenPropertyName,

    /**
      Sets whether the authenticator automatically refreshes access tokens.
      @property refreshAccessTokens
      @type Boolean
      @default true
    */
    refreshAccessTokens: defaults.refreshAccessTokens,

    /**
      The number of seconds to subtract from the token's time of expiration when
      scheduling the automatic token refresh call.
      @property refreshLeeway
      @type Integer
      @default 0 (seconds)
    */
    refreshLeeway: defaults.refreshLeeway,

    /**
      The name for which decoded token field represents the token expire time.
      @property tokenExpireName
      @type String
      @default 'exp'
    */
    tokenExpireName: defaults.tokenExpireName,

    /**
      Default time unit.
      @property timeFactor
      @type Integer
      @default 1 (seconds)
    */
    timeFactor: 1,

    /**
      The prefix used in the value of the Authorization header.
       @property authorizationPrefix
      @readOnly
      @static
      @type String
      @default 'Bearer '
    */
    authorizationPrefix: defaults.authorizationPrefix,

    /**
      The name of the HTTP Header used to send token.
       @property authorizationHeaderName
      @readOnly
      @static
      @type String
      @default 'Authorization'
    */
    authorizationHeaderName: defaults.authorizationHeaderName,

    /**
      Custom headers to be added on request.
       @property headers
      @readonly
      @static
      @type Object
      @default {}
    */
    headers: defaults.headers,

    /**
      @method load
      @private
    */
    load: loadConfig['default'](defaults)
  };

});
define('simple-auth-token/utils/load-config', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = function (defaults, callback) {
    return function (container, config) {
      var wrappedConfig = Ember['default'].Object.create(config);
      for (var property in this) {
        if (this.hasOwnProperty(property) && Ember['default'].typeOf(this[property]) !== 'function') {
          this[property] = wrappedConfig.getWithDefault(property, defaults[property]);
        }
      }
      if (callback) {
        callback.apply(this, [container, config]);
      }
    };
  }

});
define('simple-auth-token', ['simple-auth-token/index', 'ember', 'exports'], function(__index__, __Ember__, __exports__) {
  'use strict';
  var keys = Object.keys || __Ember__['default'].keys;
  var forEach = Array.prototype.forEach && function(array, cb) {
    array.forEach(cb);
  } || __Ember__['default'].EnumerableUtils.forEach;

  forEach(keys(__index__), (function(key) {
    __exports__[key] = __index__[key];
  }));
});
//# sourceMappingURL=addons.map