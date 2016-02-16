/* jshint node: true */

module.exports = function(environment) {
  //var apiHost = 'http://localhost:5000';
  var apiHost = '';
  var apiNameSpace = 'api/v1';
  var apiPath = '/' + apiNameSpace;
  var authRoute =  apiPath + '/api-token-auth';
  var authRefreshRoute = apiPath + '/api-token-refresh/';

  var ENV = {
      paginationType: "remote", 
      flashMessageDefaults: {
            preventDuplicates: true
          },
      api: {
        apiHost: apiHost,
        apiPath: apiPath,
        apiNameSpace: apiNameSpace
      },
     'simple-auth-token': {
        serverTokenEndpoint: apiHost + authRoute,
        serverTokenRefreshEndpoint: apiHost + authRefreshRoute,
        //authorizationPrefix: '',
        authorizationHeaderName: 'Authorization',
        headers: {},
        timeFactor: 1000,
        refreshLeeway: 5
    },
    'simple-auth': {
      authorizer: 'simple-auth-authorizer:token',
      session: 'session:custom',
      crossOriginWhitelist: ['*']
    },
    contentSecurityPolicy: {
        'default-src': "'none'",
        'script-src': "'self'",
        'font-src': "'self' *",
        'connect-src': "'self' *",
        'img-src': "'self' *",
        'style-src': "'self' *",
        'media-src': "'self' *"
    },
    modulePrefix: 'ember-mongo',
    environment: environment,
    baseURL: '/',
    locationType: 'hash',
    EmberENV: {
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. 'with-controller': true
      }
    },

    APP: {
      // Here you can pass flags/options to your application instance
      // when it is created
    }
  };

  if (environment === 'development') {
    // ENV.APP.LOG_RESOLVER = true;
    // ENV.APP.LOG_ACTIVE_GENERATION = true;
    // ENV.APP.LOG_TRANSITIONS = true;
    // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    // ENV.APP.LOG_VIEW_LOOKUPS = true;
  }

  if (environment === 'test') {
    // Testem prefers this...
    ENV.baseURL = '/';
    ENV.locationType = 'hash';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';
  }

  if (environment === 'production') {
    ENV.api = {
        apiHost: apiHost,
        apiPath: apiPath,
        apiNameSpace: apiNameSpace
      };
    ENV['simple-auth-token'].serverTokenEndpoint = apiHost + authRoute;
    ENV['simple-auth-token'].serverTokenRefreshEndpoint = apiHost + authRefreshRoute;
  }

  return ENV;
};
