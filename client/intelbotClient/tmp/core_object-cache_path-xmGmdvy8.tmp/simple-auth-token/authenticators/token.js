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