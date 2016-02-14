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