"use strict";
/* jshint ignore:start */

/* jshint ignore:end */

define('ember-mongo/adapters/application', ['exports', 'ember-data', 'ember-mongo/config/environment'], function (exports, DS, ENV) {

	'use strict';

	exports['default'] = DS['default'].RESTAdapter.extend({
		namespace: 'api/v1',
		host: ENV['default'].apiHost
	});

});
define('ember-mongo/app', ['exports', 'ember', 'ember/resolver', 'ember/load-initializers', 'ember-mongo/config/environment'], function (exports, Ember, Resolver, loadInitializers, config) {

  'use strict';

  var App;

  Ember['default'].MODEL_FACTORY_INJECTIONS = true;

  App = Ember['default'].Application.extend({
    modulePrefix: config['default'].modulePrefix,
    podModulePrefix: config['default'].podModulePrefix,
    Resolver: Resolver['default']
  });

  loadInitializers['default'](App, config['default'].modulePrefix);

  exports['default'] = App;

});
define('ember-mongo/components/app-version', ['exports', 'ember-cli-app-version/components/app-version', 'ember-mongo/config/environment'], function (exports, AppVersionComponent, config) {

  'use strict';

  var _config$APP = config['default'].APP;
  var name = _config$APP.name;
  var version = _config$APP.version;

  exports['default'] = AppVersionComponent['default'].extend({
    version: version,
    name: name
  });

});
define('ember-mongo/components/ember-ic-you', ['exports', 'ember-ic-you/components/ember-ic-you'], function (exports, EmberICYou) {

	'use strict';

	exports['default'] = EmberICYou['default'];

});
define('ember-mongo/components/flash-message', ['exports', 'ember-cli-flash/components/flash-message'], function (exports, FlashMessage) {

	'use strict';

	exports['default'] = FlashMessage['default'];

});
define('ember-mongo/components/image-upload', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Component.extend({
    //elementId: 'file-upload-component',
    attachments: [],
    errors: [],
    uploadUrl: '/api/files',
    isUploading: false,
    // defaults for max image size and min aspect ratio
    maxImageSize: 500000, // ~500k
    minAspectRatio: 0.75, // close to square

    fileUploadSupported: (function () {
      if (window.File) {
        return true;
      }
      return false;
    }).property(),

    didInsertElement: function didInsertElement() {
      var self = this;

      self.set('attachments', []);

      Ember['default'].$('section.errors').hide();

      Ember['default'].$('#file-upload').on('change', function () {
        self.send('addFiles', this.files);
      });

      Ember['default'].$('#image-upload-component').on('click', '#upload-trigger', function () {
        Ember['default'].$('#file-upload').trigger('click');
      });

      Ember['default'].$('.modal').on('click', function () {
        Ember['default'].$('section.errors').hide();
      });
    },

    processRawFile: function processRawFile(file) {
      return new Ember['default'].RSVP.Promise(function (resolve, reject) {
        var data = new FormData();
        data.append('file', file);
        resolve(data);
      });
    },

    processImage: function processImage(file, minAspectRatio) {
      return new Ember['default'].RSVP.Promise(function (resolve, reject) {
        var reader = new FileReader();

        reader.onloadend = function (file) {
          var image = new Image();
          image.onload = function () {

            // access image size here
            var ratio = Math.min(this.width / this.height, this.height / this.width);
            if (minAspectRatio && ratio < minAspectRatio) {
              reject("For best results, choose an image which is close to square.");
            } else {
              resolve(reader.result);
            }
          };
          // set image src here to check width/height
          image.src = file.target.result;
        };

        reader.onerror = function () {
          reject(reader.error);
        };

        reader.readAsDataURL(file);
      });
    },

    hasAttachments: (function () {
      return this.get('attachments.length') > 0;
    }).property('attachments.length'),

    actions: {
      addFiles: function addFiles(files) {
        var attachments = this.get('attachments');
        var self = this;
        var imageError = null;
        var flashMessages = Ember['default'].get(this, 'flashMessages');
        for (var i = 0; i < files.length; i++) {
          if (!attachments.findBy('name', files[i].name)) {
            if (this.get('imageUpload')) {
              if (files[i].type.match('image.*') && files[i].type !== 'image/gif') {
                if (files[i].size > parseFloat(this.get('maxImageSize'))) {
                  imageError = "That file is too large. Choose another file.";
                } else {
                  attachments.pushObject(files[i]);
                  self.send('uploadFiles');
                }
              } else {
                debugger;
                imageError = "That is not a supported file type. Choose another file.";
              }
              if (imageError) {
                flashMessages.danger(imageError);
                this.set('attachments', []);
                Ember['default'].$('#file-upload').val('');
              }
            } else {
              var allowedDocTypes = ['application/pdf', 'application/zip', 'application/msword', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.openxmlformats-officedocument.spreadsheetml.template', 'application/vnd.openxmlformats-officedocument.presentationml.template', 'application/vnd.openxmlformats-officedocument.presentationml.slideshow', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'application/vnd.openxmlformats-officedocument.presentationml.slide', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/excel', 'application/vnd.ms-excel', 'application/x-excel', 'application/x-msexcel'];

              if (allowedDocTypes.indexOf(files[i].type) > -1) {
                attachments.popObject();
                attachments.pushObject(files[i]);
              } else {
                //self.set('attachments', []);
                alert('That is not a supported document type.');
                self.set('attachments', []);
                self.set('name', null);
              }
            }
          } else {
            alert(files[i].name + ' is already in queue for upload.');
          }
        }
      },

      clearFiles: function clearFiles(file) {
        var fileId = this.get('targetController.model.avatar.content.id');

        if (this.get('imageUpload')) {
          console.log(this.get('targetController.model.avatar.content'));
          this.set('targetController.model.avatar', undefined);
          this.get('targetController.model').save();
        } else {
          this.set('attachments', []);
          Ember['default'].$('#file-upload').val('');
        }
      },

      uploadFiles: function uploadFiles() {
        var attachments = this.get('attachments'),
            self = this,
            imgMode = self.get('imageUpload'),
            doFile = imgMode ? self.get('processImage') : self.get('processRawFile'),
            callbackFunction = self.get('callbackFunction'),
            processData = !imgMode ? false : true,
            contentType = !imgMode ? false : 'application/x-www-form-urlencoded; charset=UTF-8';

        if (attachments.length < 1) {
          Ember['default'].$('section.errors').show();
          Ember['default'].$('section.errors').text('No file selected for upload.');
          return;
        }

        // if(self.get('targetController').hasOwnProperty('validators') && self.get('targetController.isInvalid')) {

        //   Ember.$('.modal input[type="text"]').trigger( "blur" );

        //   var obj = self.get('targetController.errors');
        //   Ember.$('section.errors').show();
        //   Ember.$('section.errors').html('<p>Fill out required information.</p>');

        //   for(var key in obj) {
        //     if(Array.isArray(obj[key]) && obj[key].length > 0 && obj[key][0] !== null) {
        //       for(i=0; i < obj[key].length ; i++) {
        //         var e = key+' - '+obj[key][i];
        //         Ember.$('section.errors').append('<p>'+ e +'</p>');   
        //       }
        //     }
        //   }
        //   return;
        // }

        //$('.preview-pane').append('<img src=\'/static/images/loading.gif\' class=\'load-indicator\'>');
        self.set('isUploading', true);

        var promises = attachments.map(function (file) {
          doFile(file, parseFloat(self.get('minAspectRatio'))).then(function (data) {
            var newFile = {
              fileName: file.name,
              file: data,
              description: "Helloworld"
            },
                requestObject = imgMode ? newFile : data;

            Ember['default'].$.ajax({
              url: self.get('uploadUrl'),
              data: requestObject,
              dataType: 'json',
              processData: processData,
              contentType: contentType,
              type: 'POST'
            }).then(function (response) {
              var o = response.file || response.files;
              //$('.load-indicator').remove();
              self.set('isUploading', false);

              if (imgMode) {
                store = self.container.lookup('store:main');
                store.findById('file', o.id).then(function (file) {
                  self.set('targetController.model.avatar', file);
                });
              } else {
                callbackFunction(response, self.get('targetController'));
              }
            }, function (err) {
              self.set('isUploading', false);
              flashMessages.danger('The file you selected is too large. Please try again.');
            });
          }, function (err) {
            flashMessages.danger(err);
            self.set('isUploading', false);
          });
        });

        Ember['default'].RSVP.all(promises).then(function () {
          // if(self.get('targetController').hasOwnProperty('validators') && self.get('targetController.isInvalid')) {
          //   return;
          // }
          self.set('attachments', []);
        });
      },

      updateFiles: function updateFiles() {
        var fileId = this.get('targetController.model.file.id');
        this.get('targetController.store').find('file', fileId).then(function (file) {
          file.destroyRecord();
        });
      }
    },
    beginUpload: (function () {
      var _this = this;

      if (this.get('attachments').length > 0) {
        this.set('targetController.processingRequest', true);
        this.send('uploadFiles');
        //this.set('attachments', []);
      }

      this.set('targetController.uploadRequested', false);
      // if(this.get('attachments').length < 1) {
      //   if ( this.get('uploadTrigger') === true ) {
      //     this.set('targetController.processingRequest',true);
      //     alert('w2ood');
      //     //this.send('uploadFiles');
      //   }
      // }
      // else {
      //   alert('nothing selected');
      //   this.set('targetController.uploadRequested',false);
      // }
    }).observes('uploadTrigger')
  });

});
define('ember-mongo/components/infinite-scroll-container', ['exports', 'ember-cli-infinite-scroll/components/infinite-scroll-container'], function (exports, InfiniteScrollContainer) {

	'use strict';

	exports['default'] = InfiniteScrollContainer['default'];

});
define('ember-mongo/components/infinite-scroll', ['exports', 'ember-cli-infinite-scroll/components/infinite-scroll'], function (exports, InfiniteScroll) {

	'use strict';

	exports['default'] = InfiniteScroll['default'];

});
define('ember-mongo/components/infinity-loader', ['exports', 'ember-infinity/components/infinity-loader'], function (exports, infinityLoader) {

	'use strict';

	exports['default'] = infinityLoader['default'];

});
define('ember-mongo/components/page-numbers', ['exports', 'ember', 'ember-cli-pagination/util', 'ember-cli-pagination/lib/page-items', 'ember-cli-pagination/validate'], function (exports, Ember, Util, PageItems, Validate) {

  'use strict';

  exports['default'] = Ember['default'].Component.extend({
    currentPageBinding: "content.page",
    totalPagesBinding: "content.totalPages",

    hasPages: Ember['default'].computed.gt('totalPages', 1),

    watchInvalidPage: (function () {
      var me = this;
      var c = this.get('content');
      if (c && c.on) {
        c.on('invalidPage', function (e) {
          me.sendAction('invalidPageAction', e);
        });
      }
    }).observes("content"),

    truncatePages: true,
    numPagesToShow: 10,

    validate: function validate() {
      if (Util['default'].isBlank(this.get('currentPage'))) {
        Validate['default'].internalError("no currentPage for page-numbers");
      }
      if (Util['default'].isBlank(this.get('totalPages'))) {
        Validate['default'].internalError('no totalPages for page-numbers');
      }
    },

    pageItemsObj: (function () {
      return PageItems['default'].create({
        parent: this,
        currentPageBinding: "parent.currentPage",
        totalPagesBinding: "parent.totalPages",
        truncatePagesBinding: "parent.truncatePages",
        numPagesToShowBinding: "parent.numPagesToShow",
        showFLBinding: "parent.showFL"
      });
    }).property(),

    //pageItemsBinding: "pageItemsObj.pageItems",

    pageItems: (function () {
      this.validate();
      return this.get("pageItemsObj.pageItems");
    }).property("pageItemsObj.pageItems", "pageItemsObj"),

    canStepForward: (function () {
      var page = Number(this.get("currentPage"));
      var totalPages = Number(this.get("totalPages"));
      return page < totalPages;
    }).property("currentPage", "totalPages"),

    canStepBackward: (function () {
      var page = Number(this.get("currentPage"));
      return page > 1;
    }).property("currentPage"),

    actions: {
      pageClicked: function pageClicked(number) {
        Util['default'].log("PageNumbers#pageClicked number " + number);
        this.set("currentPage", number);
        this.sendAction('action', number);
      },
      incrementPage: function incrementPage(num) {
        var currentPage = Number(this.get("currentPage")),
            totalPages = Number(this.get("totalPages"));

        if (currentPage === totalPages && num === 1) {
          return false;
        }
        if (currentPage <= 1 && num === -1) {
          return false;
        }
        this.incrementProperty('currentPage', num);

        var newPage = this.get('currentPage');
        this.sendAction('action', newPage);
      }
    }
  });

});
define('ember-mongo/controllers/array', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	exports['default'] = Ember['default'].Controller;

});
define('ember-mongo/controllers/index', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	exports['default'] = Ember['default'].Controller.extend({

		currentNote: null,
		newTitle: null,
		actions: {

			edit: function edit(note) {
				this.send('cancel', this.get('currentNote'));
				note.set('isEditing', true);
				this.set('currentNote', note);
			},
			save: function save() {
				var flashQueue = Ember['default'].get(this, 'flashMessages');
				var note = this.get('currentNote');
				var _this = this;
				note.save().then(function (note) {
					//_this.send('reload');
				}, function () {
					flashQueue.alert('Unable to save note');
				});
				note.set('isEditing', false);
				this.set('currentNote', null);
			},
			add: function add() {
				var note = this.store.createRecord('note', {
					title: this.get('newTitle'),
					content: "",
					author: "",
					isEditing: false
				});
				this.set('newTitle', null);
				this.set('currentNote', note);
				this.send('save');
			},
			'delete': function _delete(note) {
				var _this = this;
				note.destroyRecord().then(function () {
					//_this.send('reload');
				});
			},

			cancel: function cancel(note) {
				if (note) {
					note.set('isEditing', false);
					note.rollback();
				}
			}
		}
	});

});
define('ember-mongo/controllers/login', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	exports['default'] = Ember['default'].Controller.extend({
		authError: false,
		actions: {
			authenticate: function authenticate() {
				var _this = this;
				var flashQueue = Ember['default'].get(this, 'flashMessages');
				var credentials = this.getProperties('identification', 'password');
				var authenticator = 'simple-auth-authenticator:token';

				this.get('session').authenticate(authenticator, credentials).then(function () {
					_this.set('identification', null);
					_this.set('password', null);
					_this.set('authError', false);
					_this.transitionToRoute('index');
				}, function () {
					flashQueue.alert('Unable to login');
				});
			}
		}
	});

});
define('ember-mongo/controllers/object', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	exports['default'] = Ember['default'].Controller;

});
define('ember-mongo/controllers/signup', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	exports['default'] = Ember['default'].Controller.extend({
		actions: {
			signup: function signup() {
				var _this = this;
				var flashQueue = Ember['default'].get(this, 'flashMessages');
				var user = this.store.createRecord('user', {
					email: this.get('email'),
					password: this.get('password'),
					name: this.get('name'),
					avatar: this.get('avatar')
				});
				user.save().then(function () {
					var credentials = { identification: _this.get('email'), password: _this.get('password') };
					var authenticator = 'simple-auth-authenticator:token';
					_this.get('session').authenticate(authenticator, credentials).then(function () {
						user = null;
						_this.set('password', null);
						_this.set('email', null);
						_this.transitionToRoute('index');
					}, function () {
						flashQueue.alert('Unable to login');
					});;
				}, function () {
					flashQueue.alert('Unable to create user');
				});
			}
		}
	});

});
define('ember-mongo/flash/object', ['exports', 'ember-cli-flash/flash/object'], function (exports, Flash) {

	'use strict';

	exports['default'] = Flash['default'];

});
define('ember-mongo/initializers/app-version', ['exports', 'ember-cli-app-version/initializer-factory', 'ember-mongo/config/environment'], function (exports, initializerFactory, config) {

  'use strict';

  var _config$APP = config['default'].APP;
  var name = _config$APP.name;
  var version = _config$APP.version;

  exports['default'] = {
    name: 'App Version',
    initialize: initializerFactory['default'](name, version)
  };

});
define('ember-mongo/initializers/export-application-global', ['exports', 'ember', 'ember-mongo/config/environment'], function (exports, Ember, config) {

  'use strict';

  exports.initialize = initialize;

  function initialize() {
    var application = arguments[1] || arguments[0];
    if (config['default'].exportApplicationGlobal !== false) {
      var value = config['default'].exportApplicationGlobal;
      var globalName;

      if (typeof value === 'string') {
        globalName = value;
      } else {
        globalName = Ember['default'].String.classify(config['default'].modulePrefix);
      }

      if (!window[globalName]) {
        window[globalName] = application;

        application.reopen({
          willDestroy: function willDestroy() {
            this._super.apply(this, arguments);
            delete window[globalName];
          }
        });
      }
    }
  }

  exports['default'] = {
    name: 'export-application-global',

    initialize: initialize
  };

});
define('ember-mongo/initializers/flash-messages', ['exports', 'ember-mongo/config/environment'], function (exports, config) {

  'use strict';

  exports.initialize = initialize;

  function initialize() {
    var application = arguments[1] || arguments[0];
    var flashMessageDefaults = config['default'].flashMessageDefaults;
    var injectionFactories = flashMessageDefaults.injectionFactories;

    application.register('config:flash-messages', flashMessageDefaults, { instantiate: false });
    application.inject('service:flash-messages', 'flashMessageDefaults', 'config:flash-messages');

    injectionFactories.forEach(function (factory) {
      application.inject(factory, 'flashMessages', 'service:flash-messages');
    });
  }

  exports['default'] = {
    name: 'flash-messages',
    initialize: initialize
  };

});
define('ember-mongo/initializers/simple-auth-token', ['exports', 'simple-auth-token/authenticators/token', 'simple-auth-token/authenticators/jwt', 'simple-auth-token/authorizers/token', 'simple-auth-token/configuration', 'ember-mongo/config/environment'], function (exports, TokenAuthenticator, JWTAuthenticator, Authorizer, Configuration, ENV) {

  'use strict';

  exports['default'] = {
    name: 'simple-auth-token',
    before: 'simple-auth',
    initialize: function initialize(container) {
      Configuration['default'].load(container, ENV['default']['simple-auth-token'] || {});
      container.register('simple-auth-authorizer:token', Authorizer['default']);
      container.register('simple-auth-authenticator:token', TokenAuthenticator['default']);
      container.register('simple-auth-authenticator:jwt', JWTAuthenticator['default']);
    }
  };

});
define('ember-mongo/initializers/simple-auth', ['exports', 'simple-auth/configuration', 'simple-auth/setup', 'ember-mongo/config/environment'], function (exports, Configuration, setup, ENV) {

  'use strict';

  exports['default'] = {
    name: 'simple-auth',
    initialize: function initialize(container, application) {
      Configuration['default'].load(container, ENV['default']['simple-auth'] || {});
      setup['default'](container, application);
    }
  };

});
define('ember-mongo/models/note', ['exports', 'ember-data'], function (exports, DS) {

	'use strict';

	exports['default'] = DS['default'].Model.extend({
		title: DS['default'].attr('string'),
		content: DS['default'].attr('string'),
		author: DS['default'].belongsTo('user', { async: true })
	});

});
define('ember-mongo/models/user', ['exports', 'ember-data'], function (exports, DS) {

  'use strict';

  exports['default'] = DS['default'].Model.extend({
    name: DS['default'].attr(),
    email: DS['default'].attr(),
    password: DS['default'].attr(),
    isAdmin: DS['default'].attr(),
    avatar: DS['default'].attr()
  });

});
define('ember-mongo/router', ['exports', 'ember', 'ember-mongo/config/environment'], function (exports, Ember, config) {

  'use strict';

  var Router = Ember['default'].Router.extend({
    location: config['default'].locationType
  });

  Router.map(function () {
    this.route('about', {});
    this.route('contact', {});
    this.route('login');
    this.route('signup');
    this.route('profile');
  });

  exports['default'] = Router;

});
define('ember-mongo/routes/about', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	exports['default'] = Ember['default'].Route.extend({});

});
define('ember-mongo/routes/application', ['exports', 'ember', 'simple-auth/mixins/application-route-mixin'], function (exports, Ember, ApplicationRouteMixin) {

	'use strict';

	exports['default'] = Ember['default'].Route.extend(ApplicationRouteMixin['default'], {
		actions: {
			logout: function logout() {
				this.get('session').invalidate();
			},
			login: function login() {
				this.transitionTo('login');
			}
		}
	});

});
define('ember-mongo/routes/contact', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	exports['default'] = Ember['default'].Route.extend({});

});
define('ember-mongo/routes/index', ['exports', 'ember', 'simple-auth/mixins/authenticated-route-mixin', 'ember-cli-infinite-scroll/mixins/infinite-scroll-route'], function (exports, Ember, AuthenticatedRouteMixin, InfiniteScrollRouteMixin) {

  'use strict';

  exports['default'] = Ember['default'].Route.extend(InfiniteScrollRouteMixin['default'], AuthenticatedRouteMixin['default'], {
    infiniteIncrementProperty: 'start',
    infiniteIncrementBy: 'limit',
    limit: 5,
    start: 0,
    model: function model() {
      return this.infiniteQuery('note');
    },

    actions: {
      reload: function reload() {
        this.refresh();
      }
    }
  });

});
define('ember-mongo/routes/login', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	exports['default'] = Ember['default'].Route.extend({});

});
define('ember-mongo/routes/profile', ['exports', 'ember', 'simple-auth/mixins/authenticated-route-mixin'], function (exports, Ember, AuthenticatedRouteMixin) {

	'use strict';

	exports['default'] = Ember['default'].Route.extend(AuthenticatedRouteMixin['default'], {
		model: function model() {
			return this.store.find('user', this.get('session.secure.user._id'));
		}
	});

});
define('ember-mongo/routes/signup', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	exports['default'] = Ember['default'].Route.extend({});

});
define('ember-mongo/serializers/application', ['exports', 'ember-data'], function (exports, DS) {

  'use strict';

  exports['default'] = DS['default'].RESTSerializer.extend({
    normalizeHash: {
      note: function note(hash) {
        hash.id = hash._id.toString();
        delete hash._id;
        return hash;
      }
    }
  });

});
define('ember-mongo/services/flash-messages', ['exports', 'ember-cli-flash/services/flash-messages'], function (exports, FlashMessagesService) {

	'use strict';

	exports['default'] = FlashMessagesService['default'];

});
define('ember-mongo/templates/about', ['exports'], function (exports) {

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
        "moduleName": "ember-mongo/templates/about.hbs"
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
        ["content","outlet",["loc",[null,[1,0],[1,10]]]]
      ],
      locals: [],
      templates: []
    };
  }()));

});
define('ember-mongo/templates/application', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      var child0 = (function() {
        return {
          meta: {
            "revision": "Ember@1.13.7",
            "loc": {
              "source": null,
              "start": {
                "line": 10,
                "column": 8
              },
              "end": {
                "line": 12,
                "column": 8
              }
            },
            "moduleName": "ember-mongo/templates/application.hbs"
          },
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("          ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("img");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var element2 = dom.childAt(fragment, [1]);
            var morphs = new Array(1);
            morphs[0] = dom.createAttrMorph(element2, 'src');
            return morphs;
          },
          statements: [
            ["attribute","src",["get","session.secure.user.avatar",["loc",[null,[11,31],[11,57]]]]]
          ],
          locals: [],
          templates: []
        };
      }());
      var child1 = (function() {
        return {
          meta: {
            "revision": "Ember@1.13.7",
            "loc": {
              "source": null,
              "start": {
                "line": 12,
                "column": 8
              },
              "end": {
                "line": 14,
                "column": 7
              }
            },
            "moduleName": "ember-mongo/templates/application.hbs"
          },
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("          ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("img");
            dom.setAttribute(el1,"src","http://zurb.com/stickers/images/intro-foundation.png");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes() { return []; },
          statements: [

          ],
          locals: [],
          templates: []
        };
      }());
      return {
        meta: {
          "revision": "Ember@1.13.7",
          "loc": {
            "source": null,
            "start": {
              "line": 9,
              "column": 6
            },
            "end": {
              "line": 15,
              "column": 6
            }
          },
          "moduleName": "ember-mongo/templates/application.hbs"
        },
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment,0,0,contextualElement);
          dom.insertBoundary(fragment, 0);
          dom.insertBoundary(fragment, null);
          return morphs;
        },
        statements: [
          ["block","if",[["get","session.secure.user.avatar",["loc",[null,[10,14],[10,40]]]]],[],0,1,["loc",[null,[10,8],[14,14]]]]
        ],
        locals: [],
        templates: [child0, child1]
      };
    }());
    var child1 = (function() {
      return {
        meta: {
          "revision": "Ember@1.13.7",
          "loc": {
            "source": null,
            "start": {
              "line": 26,
              "column": 19
            },
            "end": {
              "line": 26,
              "column": 43
            }
          },
          "moduleName": "ember-mongo/templates/application.hbs"
        },
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("Home");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes() { return []; },
        statements: [

        ],
        locals: [],
        templates: []
      };
    }());
    var child2 = (function() {
      return {
        meta: {
          "revision": "Ember@1.13.7",
          "loc": {
            "source": null,
            "start": {
              "line": 29,
              "column": 19
            },
            "end": {
              "line": 29,
              "column": 44
            }
          },
          "moduleName": "ember-mongo/templates/application.hbs"
        },
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("About");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes() { return []; },
        statements: [

        ],
        locals: [],
        templates: []
      };
    }());
    var child3 = (function() {
      return {
        meta: {
          "revision": "Ember@1.13.7",
          "loc": {
            "source": null,
            "start": {
              "line": 32,
              "column": 19
            },
            "end": {
              "line": 32,
              "column": 48
            }
          },
          "moduleName": "ember-mongo/templates/application.hbs"
        },
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("Contact");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes() { return []; },
        statements: [

        ],
        locals: [],
        templates: []
      };
    }());
    var child4 = (function() {
      return {
        meta: {
          "revision": "Ember@1.13.7",
          "loc": {
            "source": null,
            "start": {
              "line": 35,
              "column": 6
            },
            "end": {
              "line": 38,
              "column": 6
            }
          },
          "moduleName": "ember-mongo/templates/application.hbs"
        },
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("        ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("li");
          dom.setAttribute(el1,"class","");
          var el2 = dom.createElement("a");
          var el3 = dom.createTextNode("Logout");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n        ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("li");
          dom.setAttribute(el1,"class","divider");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var element1 = dom.childAt(fragment, [1, 0]);
          var morphs = new Array(1);
          morphs[0] = dom.createElementMorph(element1);
          return morphs;
        },
        statements: [
          ["element","action",["logout"],[],["loc",[null,[36,24],[36,43]]]]
        ],
        locals: [],
        templates: []
      };
    }());
    var child5 = (function() {
      return {
        meta: {
          "revision": "Ember@1.13.7",
          "loc": {
            "source": null,
            "start": {
              "line": 38,
              "column": 6
            },
            "end": {
              "line": 41,
              "column": 6
            }
          },
          "moduleName": "ember-mongo/templates/application.hbs"
        },
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("        ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("li");
          dom.setAttribute(el1,"class","");
          var el2 = dom.createElement("a");
          var el3 = dom.createTextNode("Login");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n        ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("li");
          dom.setAttribute(el1,"class","divider");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var element0 = dom.childAt(fragment, [1, 0]);
          var morphs = new Array(1);
          morphs[0] = dom.createElementMorph(element0);
          return morphs;
        },
        statements: [
          ["element","action",["login"],[],["loc",[null,[39,24],[39,42]]]]
        ],
        locals: [],
        templates: []
      };
    }());
    var child6 = (function() {
      return {
        meta: {
          "revision": "Ember@1.13.7",
          "loc": {
            "source": null,
            "start": {
              "line": 56,
              "column": 6
            },
            "end": {
              "line": 60,
              "column": 6
            }
          },
          "moduleName": "ember-mongo/templates/application.hbs"
        },
        arity: 1,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("       ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("span");
          dom.setAttribute(el1,"class","flash-message");
          var el2 = dom.createTextNode("\n          ");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n        ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(dom.childAt(fragment, [1]),1,1);
          return morphs;
        },
        statements: [
          ["inline","flash-message",[],["flash",["subexpr","@mut",[["get","flash",["loc",[null,[58,32],[58,37]]]]],[],[]],"messageStyle","foundation","class","radius"],["loc",[null,[58,10],[58,82]]]]
        ],
        locals: ["flash"],
        templates: []
      };
    }());
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
            "line": 68,
            "column": 0
          }
        },
        "moduleName": "ember-mongo/templates/application.hbs"
      },
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("link");
        dom.setAttribute(el1,"href","https://cdnjs.cloudflare.com/ajax/libs/foundicons/3.0.0/foundation-icons.css");
        dom.setAttribute(el1,"rel","stylesheet");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("nav");
        dom.setAttribute(el1,"class","top-bar");
        dom.setAttribute(el1,"data-topbar","");
        dom.setAttribute(el1,"role","navigation");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("ul");
        dom.setAttribute(el2,"class","title-area");
        var el3 = dom.createTextNode("\n ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("li");
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","logo");
        var el5 = dom.createTextNode("\n");
        dom.appendChild(el4, el5);
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("    ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n  ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n     ");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment(" Remove the class \"menu-icon\" to get rid of menu icon. Take out \"Menu\" to just have icon alone ");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("li");
        dom.setAttribute(el3,"class","toggle-topbar menu-icon");
        var el4 = dom.createElement("a");
        dom.setAttribute(el4,"href","#");
        var el5 = dom.createElement("span");
        var el6 = dom.createTextNode("Menu");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("section");
        dom.setAttribute(el2,"class","top-bar-section");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment(" Right Nav Section ");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("ul");
        dom.setAttribute(el3,"class","right");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("li");
        dom.setAttribute(el4,"class","");
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("li");
        dom.setAttribute(el4,"class","divider");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      \n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("li");
        dom.setAttribute(el4,"class","");
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("li");
        dom.setAttribute(el4,"class","divider");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      \n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("li");
        dom.setAttribute(el4,"class","");
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("li");
        dom.setAttribute(el4,"class","divider");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n\n");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("ul");
        dom.setAttribute(el3,"class","social-icons");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("li");
        var el5 = dom.createElement("a");
        dom.setAttribute(el5,"href","");
        var el6 = dom.createElement("i");
        dom.setAttribute(el6,"class","fi-telephone");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("li");
        var el5 = dom.createElement("a");
        dom.setAttribute(el5,"href","");
        var el6 = dom.createElement("i");
        dom.setAttribute(el6,"class","fi-social-linkedin");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("li");
        var el5 = dom.createElement("a");
        dom.setAttribute(el5,"href","");
        var el6 = dom.createElement("i");
        dom.setAttribute(el6,"class","fi-social-twitter");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("li");
        var el5 = dom.createElement("a");
        dom.setAttribute(el5,"href","");
        var el6 = dom.createElement("i");
        dom.setAttribute(el6,"class","fi-social-facebook");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","small-8 medium-4 large-3 small-centered medium-centered large-centered columns");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","row");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"id","flash-message");
        var el4 = dom.createTextNode("\n");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element3 = dom.childAt(fragment, [2]);
        var element4 = dom.childAt(element3, [3, 3]);
        var morphs = new Array(7);
        morphs[0] = dom.createMorphAt(dom.childAt(element3, [1, 1, 1]),1,1);
        morphs[1] = dom.createMorphAt(dom.childAt(element4, [1]),0,0);
        morphs[2] = dom.createMorphAt(dom.childAt(element4, [5]),0,0);
        morphs[3] = dom.createMorphAt(dom.childAt(element4, [9]),0,0);
        morphs[4] = dom.createMorphAt(element4,13,13);
        morphs[5] = dom.createMorphAt(dom.childAt(fragment, [4, 1, 1]),1,1);
        morphs[6] = dom.createMorphAt(fragment,6,6,contextualElement);
        return morphs;
      },
      statements: [
        ["block","link-to",["profile"],[],0,null,["loc",[null,[9,6],[15,18]]]],
        ["block","link-to",["index"],[],1,null,["loc",[null,[26,19],[26,55]]]],
        ["block","link-to",["about"],[],2,null,["loc",[null,[29,19],[29,56]]]],
        ["block","link-to",["contact"],[],3,null,["loc",[null,[32,19],[32,60]]]],
        ["block","if",[["get","session.isAuthenticated",["loc",[null,[35,12],[35,35]]]]],[],4,5,["loc",[null,[35,6],[41,13]]]],
        ["block","each",[["get","flashMessages.queue",["loc",[null,[56,14],[56,33]]]]],[],6,null,["loc",[null,[56,6],[60,15]]]],
        ["content","outlet",["loc",[null,[65,0],[65,10]]]]
      ],
      locals: [],
      templates: [child0, child1, child2, child3, child4, child5, child6]
    };
  }()));

});
define('ember-mongo/templates/components/ember-ic-you', ['exports'], function (exports) {

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
            "line": 1,
            "column": 9
          }
        },
        "moduleName": "ember-mongo/templates/components/ember-ic-you.hbs"
      },
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var morphs = new Array(1);
        morphs[0] = dom.createMorphAt(fragment,0,0,contextualElement);
        dom.insertBoundary(fragment, 0);
        dom.insertBoundary(fragment, null);
        return morphs;
      },
      statements: [
        ["content","yield",["loc",[null,[1,0],[1,9]]]]
      ],
      locals: [],
      templates: []
    };
  }()));

});
define('ember-mongo/templates/components/image-upload', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        meta: {
          "revision": "Ember@1.13.7",
          "loc": {
            "source": null,
            "start": {
              "line": 4,
              "column": 4
            },
            "end": {
              "line": 6,
              "column": 4
            }
          },
          "moduleName": "ember-mongo/templates/components/image-upload.hbs"
        },
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("      ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment,1,1,contextualElement);
          return morphs;
        },
        statements: [
          ["inline","partial",["partials/spinner"],[],["loc",[null,[5,6],[5,36]]]]
        ],
        locals: [],
        templates: []
      };
    }());
    var child1 = (function() {
      var child0 = (function() {
        return {
          meta: {
            "revision": "Ember@1.13.7",
            "loc": {
              "source": null,
              "start": {
                "line": 9,
                "column": 6
              },
              "end": {
                "line": 19,
                "column": 6
              }
            },
            "moduleName": "ember-mongo/templates/components/image-upload.hbs"
          },
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("        ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("div");
            dom.setAttribute(el1,"id","upload-trigger");
            dom.setAttribute(el1,"class","btn primary");
            var el2 = dom.createTextNode("\n          ");
            dom.appendChild(el1, el2);
            var el2 = dom.createElement("button");
            dom.setAttribute(el2,"type","button");
            var el3 = dom.createTextNode("\n            ");
            dom.appendChild(el2, el3);
            var el3 = dom.createElement("i");
            dom.setAttribute(el3,"class","icon-camera");
            dom.appendChild(el2, el3);
            var el3 = dom.createTextNode("\n            Upload photo\n            ");
            dom.appendChild(el2, el3);
            var el3 = dom.createElement("br");
            dom.appendChild(el2, el3);
            var el3 = dom.createElement("small");
            var el4 = dom.createTextNode("(under 500k)");
            dom.appendChild(el3, el4);
            dom.appendChild(el2, el3);
            var el3 = dom.createTextNode("\n          ");
            dom.appendChild(el2, el3);
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n        ");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes() { return []; },
          statements: [

          ],
          locals: [],
          templates: []
        };
      }());
      return {
        meta: {
          "revision": "Ember@1.13.7",
          "loc": {
            "source": null,
            "start": {
              "line": 8,
              "column": 4
            },
            "end": {
              "line": 20,
              "column": 4
            }
          },
          "moduleName": "ember-mongo/templates/components/image-upload.hbs"
        },
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment,0,0,contextualElement);
          dom.insertBoundary(fragment, 0);
          dom.insertBoundary(fragment, null);
          return morphs;
        },
        statements: [
          ["block","unless",[["get","isUploading",["loc",[null,[9,16],[9,27]]]]],[],0,null,["loc",[null,[9,6],[19,17]]]]
        ],
        locals: [],
        templates: [child0]
      };
    }());
    var child2 = (function() {
      return {
        meta: {
          "revision": "Ember@1.13.7",
          "loc": {
            "source": null,
            "start": {
              "line": 20,
              "column": 4
            },
            "end": {
              "line": 24,
              "column": 4
            }
          },
          "moduleName": "ember-mongo/templates/components/image-upload.hbs"
        },
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("      ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1,"id","not-supported");
          var el2 = dom.createTextNode("\n        Please open CoachLogix in Chrome, Firefox, Safari or IE10+ to upload images.\n      ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes() { return []; },
        statements: [

        ],
        locals: [],
        templates: []
      };
    }());
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
            "line": 29,
            "column": 0
          }
        },
        "moduleName": "ember-mongo/templates/components/image-upload.hbs"
      },
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("section");
        dom.setAttribute(el1,"id","image-upload-component");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"id","uploader");
        var el3 = dom.createTextNode("\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("input");
        dom.setAttribute(el2,"type","file");
        dom.setAttribute(el2,"id","file-upload");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element0 = dom.childAt(fragment, [1]);
        var element1 = dom.childAt(element0, [1]);
        var morphs = new Array(4);
        morphs[0] = dom.createAttrMorph(element1, 'class');
        morphs[1] = dom.createMorphAt(element1,1,1);
        morphs[2] = dom.createMorphAt(element1,3,3);
        morphs[3] = dom.createMorphAt(element0,5,5);
        return morphs;
      },
      statements: [
        ["attribute","class",["concat",[["subexpr","if",[["get","isUploading",[]],"uploading",""],[],[]]]]],
        ["block","if",[["get","isUploading",["loc",[null,[4,10],[4,21]]]]],[],0,null,["loc",[null,[4,4],[6,11]]]],
        ["block","if",[["get","fileUploadSupported",["loc",[null,[8,10],[8,29]]]]],[],1,2,["loc",[null,[8,4],[24,11]]]],
        ["content","yield",["loc",[null,[27,2],[27,11]]]]
      ],
      locals: [],
      templates: [child0, child1, child2]
    };
  }()));

});
define('ember-mongo/templates/components/infinite-scroll-container', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      var child0 = (function() {
        return {
          meta: {
            "revision": "Ember@1.13.7",
            "loc": {
              "source": null,
              "start": {
                "line": 2,
                "column": 2
              },
              "end": {
                "line": 13,
                "column": 2
              }
            },
            "moduleName": "ember-mongo/templates/components/infinite-scroll-container.hbs"
          },
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("    ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("h3");
            var el2 = dom.createTextNode("\n      ");
            dom.appendChild(el1, el2);
            var el2 = dom.createComment("");
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n    ");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n    ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("hr");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n    ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("img");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n    ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("hr");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n    ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("div");
            dom.setAttribute(el1,"class","container-body-text");
            var el2 = dom.createTextNode("\n      ");
            dom.appendChild(el1, el2);
            var el2 = dom.createComment("");
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n    ");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n    ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("hr");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var element0 = dom.childAt(fragment, [5]);
            var morphs = new Array(3);
            morphs[0] = dom.createMorphAt(dom.childAt(fragment, [1]),1,1);
            morphs[1] = dom.createAttrMorph(element0, 'src');
            morphs[2] = dom.createUnsafeMorphAt(dom.childAt(fragment, [9]),1,1);
            return morphs;
          },
          statements: [
            ["content","post.title",["loc",[null,[4,6],[4,20]]]],
            ["attribute","src",["get","post.imageUrl",["loc",[null,[7,25],[7,38]]]]],
            ["content","post.body",["loc",[null,[10,6],[10,21]]]]
          ],
          locals: [],
          templates: []
        };
      }());
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
              "line": 14,
              "column": 0
            }
          },
          "moduleName": "ember-mongo/templates/components/infinite-scroll-container.hbs"
        },
        arity: 1,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment,0,0,contextualElement);
          dom.insertBoundary(fragment, 0);
          dom.insertBoundary(fragment, null);
          return morphs;
        },
        statements: [
          ["block","if",[["get","post.imageUrl",["loc",[null,[2,8],[2,21]]]]],[],0,null,["loc",[null,[2,2],[13,9]]]]
        ],
        locals: ["post"],
        templates: [child0]
      };
    }());
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
            "line": 15,
            "column": 51
          }
        },
        "moduleName": "ember-mongo/templates/components/infinite-scroll-container.hbs"
      },
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var morphs = new Array(2);
        morphs[0] = dom.createMorphAt(fragment,0,0,contextualElement);
        morphs[1] = dom.createMorphAt(fragment,1,1,contextualElement);
        dom.insertBoundary(fragment, 0);
        dom.insertBoundary(fragment, null);
        return morphs;
      },
      statements: [
        ["block","each",[["get","model",["loc",[null,[1,8],[1,13]]]]],[],0,null,["loc",[null,[1,0],[14,9]]]],
        ["inline","infinite-scroll",[],["scrollContainer",["subexpr","@mut",[["get","scrollContainer",["loc",[null,[15,34],[15,49]]]]],[],[]]],["loc",[null,[15,0],[15,51]]]]
      ],
      locals: [],
      templates: [child0]
    };
  }()));

});
define('ember-mongo/templates/components/infinite-scroll', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
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
              "line": 3,
              "column": 0
            }
          },
          "moduleName": "ember-mongo/templates/components/infinite-scroll.hbs"
        },
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment,1,1,contextualElement);
          return morphs;
        },
        statements: [
          ["inline","ember-ic-you",[],["crossedTheLine","performInfinite","triggerDistance",["subexpr","@mut",[["get","triggerDistance",["loc",[null,[2,66],[2,81]]]]],[],[]],"scrollContainer",["subexpr","@mut",[["get","scrollContainer",["loc",[null,[2,98],[2,113]]]]],[],[]]],["loc",[null,[2,2],[2,115]]]]
        ],
        locals: [],
        templates: []
      };
    }());
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
            "line": 5,
            "column": 9
          }
        },
        "moduleName": "ember-mongo/templates/components/infinite-scroll.hbs"
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
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var morphs = new Array(2);
        morphs[0] = dom.createMorphAt(fragment,0,0,contextualElement);
        morphs[1] = dom.createMorphAt(fragment,2,2,contextualElement);
        dom.insertBoundary(fragment, 0);
        dom.insertBoundary(fragment, null);
        return morphs;
      },
      statements: [
        ["block","if",[["get","infiniteScrollAvailable",["loc",[null,[1,6],[1,29]]]]],[],0,null,["loc",[null,[1,0],[3,7]]]],
        ["content","yield",["loc",[null,[5,0],[5,9]]]]
      ],
      locals: [],
      templates: [child0]
    };
  }()));

});
define('ember-mongo/templates/components/infinity-loader', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
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
              "line": 3,
              "column": 0
            }
          },
          "moduleName": "ember-mongo/templates/components/infinity-loader.hbs"
        },
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment,1,1,contextualElement);
          return morphs;
        },
        statements: [
          ["content","yield",["loc",[null,[2,2],[2,11]]]]
        ],
        locals: [],
        templates: []
      };
    }());
    var child1 = (function() {
      var child0 = (function() {
        return {
          meta: {
            "revision": "Ember@1.13.7",
            "loc": {
              "source": null,
              "start": {
                "line": 4,
                "column": 2
              },
              "end": {
                "line": 6,
                "column": 2
              }
            },
            "moduleName": "ember-mongo/templates/components/infinity-loader.hbs"
          },
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("    ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("span");
            var el2 = dom.createComment("");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var morphs = new Array(1);
            morphs[0] = dom.createMorphAt(dom.childAt(fragment, [1]),0,0);
            return morphs;
          },
          statements: [
            ["content","loadedText",["loc",[null,[5,10],[5,24]]]]
          ],
          locals: [],
          templates: []
        };
      }());
      var child1 = (function() {
        return {
          meta: {
            "revision": "Ember@1.13.7",
            "loc": {
              "source": null,
              "start": {
                "line": 6,
                "column": 2
              },
              "end": {
                "line": 8,
                "column": 2
              }
            },
            "moduleName": "ember-mongo/templates/components/infinity-loader.hbs"
          },
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("    ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("span");
            var el2 = dom.createComment("");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var morphs = new Array(1);
            morphs[0] = dom.createMorphAt(dom.childAt(fragment, [1]),0,0);
            return morphs;
          },
          statements: [
            ["content","loadingText",["loc",[null,[7,10],[7,25]]]]
          ],
          locals: [],
          templates: []
        };
      }());
      return {
        meta: {
          "revision": "Ember@1.13.7",
          "loc": {
            "source": null,
            "start": {
              "line": 3,
              "column": 0
            },
            "end": {
              "line": 9,
              "column": 0
            }
          },
          "moduleName": "ember-mongo/templates/components/infinity-loader.hbs"
        },
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment,0,0,contextualElement);
          dom.insertBoundary(fragment, 0);
          dom.insertBoundary(fragment, null);
          return morphs;
        },
        statements: [
          ["block","if",[["get","infinityModel.reachedInfinity",["loc",[null,[4,8],[4,37]]]]],[],0,1,["loc",[null,[4,2],[8,9]]]]
        ],
        locals: [],
        templates: [child0, child1]
      };
    }());
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
            "line": 10,
            "column": 0
          }
        },
        "moduleName": "ember-mongo/templates/components/infinity-loader.hbs"
      },
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var morphs = new Array(1);
        morphs[0] = dom.createMorphAt(fragment,0,0,contextualElement);
        dom.insertBoundary(fragment, 0);
        dom.insertBoundary(fragment, null);
        return morphs;
      },
      statements: [
        ["block","if",[["get","hasBlock",["loc",[null,[1,6],[1,14]]]]],[],0,1,["loc",[null,[1,0],[9,7]]]]
      ],
      locals: [],
      templates: [child0, child1]
    };
  }()));

});
define('ember-mongo/templates/components/page-numbers', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        meta: {
          "revision": "Ember@1.13.7",
          "loc": {
            "source": null,
            "start": {
              "line": 3,
              "column": 4
            },
            "end": {
              "line": 7,
              "column": 4
            }
          },
          "moduleName": "ember-mongo/templates/components/page-numbers.hbs"
        },
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("      ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("li");
          dom.setAttribute(el1,"class","arrow prev enabled-arrow");
          var el2 = dom.createTextNode("\n        ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("a");
          dom.setAttribute(el2,"href","#");
          var el3 = dom.createTextNode("«");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n      ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var element4 = dom.childAt(fragment, [1, 1]);
          var morphs = new Array(1);
          morphs[0] = dom.createElementMorph(element4);
          return morphs;
        },
        statements: [
          ["element","action",["incrementPage",-1],[],["loc",[null,[5,20],[5,49]]]]
        ],
        locals: [],
        templates: []
      };
    }());
    var child1 = (function() {
      return {
        meta: {
          "revision": "Ember@1.13.7",
          "loc": {
            "source": null,
            "start": {
              "line": 7,
              "column": 4
            },
            "end": {
              "line": 11,
              "column": 4
            }
          },
          "moduleName": "ember-mongo/templates/components/page-numbers.hbs"
        },
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("      ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("li");
          dom.setAttribute(el1,"class","arrow prev disabled");
          var el2 = dom.createTextNode("\n        ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("a");
          dom.setAttribute(el2,"href","#");
          var el3 = dom.createTextNode("«");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n      ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var element3 = dom.childAt(fragment, [1, 1]);
          var morphs = new Array(1);
          morphs[0] = dom.createElementMorph(element3);
          return morphs;
        },
        statements: [
          ["element","action",["incrementPage",-1],[],["loc",[null,[9,20],[9,49]]]]
        ],
        locals: [],
        templates: []
      };
    }());
    var child2 = (function() {
      var child0 = (function() {
        return {
          meta: {
            "revision": "Ember@1.13.7",
            "loc": {
              "source": null,
              "start": {
                "line": 14,
                "column": 6
              },
              "end": {
                "line": 18,
                "column": 6
              }
            },
            "moduleName": "ember-mongo/templates/components/page-numbers.hbs"
          },
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("        ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("li");
            dom.setAttribute(el1,"class","dots disabled");
            var el2 = dom.createTextNode("\n          ");
            dom.appendChild(el1, el2);
            var el2 = dom.createElement("span");
            var el3 = dom.createTextNode("...");
            dom.appendChild(el2, el3);
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n        ");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes() { return []; },
          statements: [

          ],
          locals: [],
          templates: []
        };
      }());
      var child1 = (function() {
        return {
          meta: {
            "revision": "Ember@1.13.7",
            "loc": {
              "source": null,
              "start": {
                "line": 19,
                "column": 6
              },
              "end": {
                "line": 23,
                "column": 6
              }
            },
            "moduleName": "ember-mongo/templates/components/page-numbers.hbs"
          },
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("        ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("li");
            dom.setAttribute(el1,"class","active page-number");
            var el2 = dom.createTextNode("\n          ");
            dom.appendChild(el1, el2);
            var el2 = dom.createElement("a");
            dom.setAttribute(el2,"href","#");
            var el3 = dom.createComment("");
            dom.appendChild(el2, el3);
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n        ");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var morphs = new Array(1);
            morphs[0] = dom.createMorphAt(dom.childAt(fragment, [1, 1]),0,0);
            return morphs;
          },
          statements: [
            ["content","item.page",["loc",[null,[21,22],[21,35]]]]
          ],
          locals: [],
          templates: []
        };
      }());
      var child2 = (function() {
        return {
          meta: {
            "revision": "Ember@1.13.7",
            "loc": {
              "source": null,
              "start": {
                "line": 23,
                "column": 6
              },
              "end": {
                "line": 27,
                "column": 6
              }
            },
            "moduleName": "ember-mongo/templates/components/page-numbers.hbs"
          },
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("        ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("li");
            dom.setAttribute(el1,"class","page-number");
            var el2 = dom.createTextNode("\n          ");
            dom.appendChild(el1, el2);
            var el2 = dom.createElement("a");
            dom.setAttribute(el2,"href","#");
            var el3 = dom.createComment("");
            dom.appendChild(el2, el3);
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n        ");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var element2 = dom.childAt(fragment, [1, 1]);
            var morphs = new Array(2);
            morphs[0] = dom.createElementMorph(element2);
            morphs[1] = dom.createMorphAt(element2,0,0);
            return morphs;
          },
          statements: [
            ["element","action",["pageClicked",["get","item.page",["loc",[null,[25,45],[25,54]]]]],[],["loc",[null,[25,22],[25,56]]]],
            ["content","item.page",["loc",[null,[25,57],[25,70]]]]
          ],
          locals: [],
          templates: []
        };
      }());
      return {
        meta: {
          "revision": "Ember@1.13.7",
          "loc": {
            "source": null,
            "start": {
              "line": 13,
              "column": 4
            },
            "end": {
              "line": 28,
              "column": 4
            }
          },
          "moduleName": "ember-mongo/templates/components/page-numbers.hbs"
        },
        arity: 1,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(2);
          morphs[0] = dom.createMorphAt(fragment,0,0,contextualElement);
          morphs[1] = dom.createMorphAt(fragment,1,1,contextualElement);
          dom.insertBoundary(fragment, 0);
          dom.insertBoundary(fragment, null);
          return morphs;
        },
        statements: [
          ["block","if",[["get","item.dots",["loc",[null,[14,12],[14,21]]]]],[],0,null,["loc",[null,[14,6],[18,13]]]],
          ["block","if",[["get","item.current",["loc",[null,[19,12],[19,24]]]]],[],1,2,["loc",[null,[19,6],[27,13]]]]
        ],
        locals: ["item"],
        templates: [child0, child1, child2]
      };
    }());
    var child3 = (function() {
      return {
        meta: {
          "revision": "Ember@1.13.7",
          "loc": {
            "source": null,
            "start": {
              "line": 30,
              "column": 4
            },
            "end": {
              "line": 34,
              "column": 4
            }
          },
          "moduleName": "ember-mongo/templates/components/page-numbers.hbs"
        },
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("      ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("li");
          dom.setAttribute(el1,"class","arrow next enabled-arrow");
          var el2 = dom.createTextNode("\n        ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("a");
          dom.setAttribute(el2,"href","#");
          var el3 = dom.createTextNode("»");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n      ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var element1 = dom.childAt(fragment, [1, 1]);
          var morphs = new Array(1);
          morphs[0] = dom.createElementMorph(element1);
          return morphs;
        },
        statements: [
          ["element","action",["incrementPage",1],[],["loc",[null,[32,20],[32,48]]]]
        ],
        locals: [],
        templates: []
      };
    }());
    var child4 = (function() {
      return {
        meta: {
          "revision": "Ember@1.13.7",
          "loc": {
            "source": null,
            "start": {
              "line": 34,
              "column": 4
            },
            "end": {
              "line": 38,
              "column": 4
            }
          },
          "moduleName": "ember-mongo/templates/components/page-numbers.hbs"
        },
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("      ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("li");
          dom.setAttribute(el1,"class","arrow next disabled");
          var el2 = dom.createTextNode("\n        ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("a");
          dom.setAttribute(el2,"href","#");
          var el3 = dom.createTextNode("»");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n      ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var element0 = dom.childAt(fragment, [1, 1]);
          var morphs = new Array(1);
          morphs[0] = dom.createElementMorph(element0);
          return morphs;
        },
        statements: [
          ["element","action",["incrementPage",1],[],["loc",[null,[36,20],[36,48]]]]
        ],
        locals: [],
        templates: []
      };
    }());
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
            "line": 41,
            "column": 0
          }
        },
        "moduleName": "ember-mongo/templates/components/page-numbers.hbs"
      },
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","pagination-centered");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("ul");
        dom.setAttribute(el2,"class","pagination");
        var el3 = dom.createTextNode("\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element5 = dom.childAt(fragment, [0, 1]);
        var morphs = new Array(3);
        morphs[0] = dom.createMorphAt(element5,1,1);
        morphs[1] = dom.createMorphAt(element5,3,3);
        morphs[2] = dom.createMorphAt(element5,5,5);
        return morphs;
      },
      statements: [
        ["block","if",[["get","canStepBackward",["loc",[null,[3,10],[3,25]]]]],[],0,1,["loc",[null,[3,4],[11,11]]]],
        ["block","each",[["get","pageItems",["loc",[null,[13,12],[13,21]]]]],[],2,null,["loc",[null,[13,4],[28,13]]]],
        ["block","if",[["get","canStepForward",["loc",[null,[30,10],[30,24]]]]],[],3,4,["loc",[null,[30,4],[38,11]]]]
      ],
      locals: [],
      templates: [child0, child1, child2, child3, child4]
    };
  }()));

});
define('ember-mongo/templates/contact', ['exports'], function (exports) {

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
        "moduleName": "ember-mongo/templates/contact.hbs"
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
        ["content","outlet",["loc",[null,[1,0],[1,10]]]]
      ],
      locals: [],
      templates: []
    };
  }()));

});
define('ember-mongo/templates/index', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      var child0 = (function() {
        return {
          meta: {
            "revision": "Ember@1.13.7",
            "loc": {
              "source": null,
              "start": {
                "line": 11,
                "column": 2
              },
              "end": {
                "line": 13,
                "column": 2
              }
            },
            "moduleName": "ember-mongo/templates/index.hbs"
          },
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("			");
            dom.appendChild(el0, el1);
            var el1 = dom.createComment("");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var morphs = new Array(1);
            morphs[0] = dom.createMorphAt(fragment,1,1,contextualElement);
            return morphs;
          },
          statements: [
            ["inline","input",[],["placeholder","Title","type","text","value",["subexpr","@mut",[["get","note.title",["loc",[null,[12,71],[12,81]]]]],[],[]],"enter","save"],["loc",[null,[12,3],[12,83]]]]
          ],
          locals: [],
          templates: []
        };
      }());
      var child1 = (function() {
        return {
          meta: {
            "revision": "Ember@1.13.7",
            "loc": {
              "source": null,
              "start": {
                "line": 13,
                "column": 2
              },
              "end": {
                "line": 22,
                "column": 2
              }
            },
            "moduleName": "ember-mongo/templates/index.hbs"
          },
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("			");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("div");
            dom.setAttribute(el1,"class","row");
            var el2 = dom.createTextNode("\n				");
            dom.appendChild(el1, el2);
            var el2 = dom.createElement("div");
            dom.setAttribute(el2,"class","small-1 medium-1 large-1 column");
            var el3 = dom.createTextNode("\n					");
            dom.appendChild(el2, el3);
            var el3 = dom.createElement("i");
            dom.setAttribute(el3,"class","fi-minus icon-cancel");
            dom.appendChild(el2, el3);
            var el3 = dom.createTextNode("\n				");
            dom.appendChild(el2, el3);
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n				");
            dom.appendChild(el1, el2);
            var el2 = dom.createElement("div");
            dom.setAttribute(el2,"class","small-4 medium-4 large-4 column left");
            var el3 = dom.createTextNode("\n					");
            dom.appendChild(el2, el3);
            var el3 = dom.createElement("span");
            dom.setAttribute(el3,"class","title");
            var el4 = dom.createComment("");
            dom.appendChild(el3, el4);
            dom.appendChild(el2, el3);
            var el3 = dom.createTextNode("\n				");
            dom.appendChild(el2, el3);
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n			");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var element0 = dom.childAt(fragment, [1]);
            var element1 = dom.childAt(element0, [1, 1]);
            var element2 = dom.childAt(element0, [3, 1]);
            var morphs = new Array(3);
            morphs[0] = dom.createElementMorph(element1);
            morphs[1] = dom.createElementMorph(element2);
            morphs[2] = dom.createMorphAt(element2,0,0);
            return morphs;
          },
          statements: [
            ["element","action",["delete",["get","note",["loc",[null,[16,57],[16,61]]]]],[],["loc",[null,[16,39],[16,63]]]],
            ["element","action",["edit",["get","note",["loc",[null,[19,43],[19,47]]]]],[],["loc",[null,[19,27],[19,49]]]],
            ["content","note.title",["loc",[null,[19,50],[19,64]]]]
          ],
          locals: [],
          templates: []
        };
      }());
      return {
        meta: {
          "revision": "Ember@1.13.7",
          "loc": {
            "source": null,
            "start": {
              "line": 9,
              "column": 1
            },
            "end": {
              "line": 24,
              "column": 1
            }
          },
          "moduleName": "ember-mongo/templates/index.hbs"
        },
        arity: 1,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("		");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1,"class","row note");
          var el2 = dom.createTextNode("\n");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("		");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(dom.childAt(fragment, [1]),1,1);
          return morphs;
        },
        statements: [
          ["block","if",[["get","note.isEditing",["loc",[null,[11,8],[11,22]]]]],[],0,1,["loc",[null,[11,2],[22,9]]]]
        ],
        locals: ["note"],
        templates: [child0, child1]
      };
    }());
    var child1 = (function() {
      return {
        meta: {
          "revision": "Ember@1.13.7",
          "loc": {
            "source": null,
            "start": {
              "line": 26,
              "column": 1
            },
            "end": {
              "line": 28,
              "column": 1
            }
          },
          "moduleName": "ember-mongo/templates/index.hbs"
        },
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("  		You're at the end of the line.\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes() { return []; },
        statements: [

        ],
        locals: [],
        templates: []
      };
    }());
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
            "line": 32,
            "column": 10
          }
        },
        "moduleName": "ember-mongo/templates/index.hbs"
      },
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","notes");
        var el2 = dom.createTextNode("\n\n");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","row");
        var el3 = dom.createTextNode("\n	Notes\n");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","row");
        var el3 = dom.createTextNode("\n	");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("	");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element3 = dom.childAt(fragment, [0]);
        var morphs = new Array(6);
        morphs[0] = dom.createMorphAt(dom.childAt(element3, [3]),1,1);
        morphs[1] = dom.createMorphAt(element3,5,5);
        morphs[2] = dom.createMorphAt(element3,7,7);
        morphs[3] = dom.createMorphAt(element3,9,9);
        morphs[4] = dom.createMorphAt(fragment,2,2,contextualElement);
        morphs[5] = dom.createMorphAt(fragment,4,4,contextualElement);
        dom.insertBoundary(fragment, null);
        return morphs;
      },
      statements: [
        ["inline","input",[],["placeholder","new","type","text","value",["subexpr","@mut",[["get","newTitle",["loc",[null,[7,66],[7,74]]]]],[],[]],"enter","add"],["loc",[null,[7,1],[7,76]]]],
        ["block","each",[["get","model",["loc",[null,[9,9],[9,14]]]]],[],0,null,["loc",[null,[9,1],[24,10]]]],
        ["content","infinite-scroll",["loc",[null,[25,1],[25,20]]]],
        ["block","unless",[["get","hasMoreContent",["loc",[null,[26,11],[26,25]]]]],[],1,null,["loc",[null,[26,1],[28,12]]]],
        ["inline","image-upload",[],["imageUpload",true],["loc",[null,[31,0],[31,33]]]],
        ["content","outlet",["loc",[null,[32,0],[32,10]]]]
      ],
      locals: [],
      templates: [child0, child1]
    };
  }()));

});
define('ember-mongo/templates/login', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        meta: {
          "revision": "Ember@1.13.7",
          "loc": {
            "source": null,
            "start": {
              "line": 22,
              "column": 14
            },
            "end": {
              "line": 22,
              "column": 42
            }
          },
          "moduleName": "ember-mongo/templates/login.hbs"
        },
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("Sign Up");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes() { return []; },
        statements: [

        ],
        locals: [],
        templates: []
      };
    }());
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
            "line": 30,
            "column": 0
          }
        },
        "moduleName": "ember-mongo/templates/login.hbs"
      },
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","small-8 medium-4 large-3 small-centered medium-centered large-centered columns");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","login-box");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","row");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","columns");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("form");
        var el6 = dom.createTextNode("\n           ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("div");
        dom.setAttribute(el6,"class","row");
        var el7 = dom.createTextNode("\n             ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("div");
        dom.setAttribute(el7,"class","columns");
        var el8 = dom.createTextNode("\n    	  		   ");
        dom.appendChild(el7, el8);
        var el8 = dom.createComment("");
        dom.appendChild(el7, el8);
        var el8 = dom.createTextNode("\n             ");
        dom.appendChild(el7, el8);
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n           ");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("div");
        dom.setAttribute(el6,"class","row");
        var el7 = dom.createTextNode("\n             ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("div");
        dom.setAttribute(el7,"class","columns");
        var el8 = dom.createTextNode("\n    	  		   ");
        dom.appendChild(el7, el8);
        var el8 = dom.createComment("");
        dom.appendChild(el7, el8);
        var el8 = dom.createTextNode("\n             ");
        dom.appendChild(el7, el8);
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n          ");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("div");
        dom.setAttribute(el6,"class","row");
        var el7 = dom.createTextNode("\n            ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("div");
        dom.setAttribute(el7,"class","centered columns");
        var el8 = dom.createTextNode("\n              ");
        dom.appendChild(el7, el8);
        var el8 = dom.createElement("input");
        dom.setAttribute(el8,"type","submit");
        dom.setAttribute(el8,"class","expand button");
        dom.setAttribute(el8,"value","Log In");
        dom.appendChild(el7, el8);
        var el8 = dom.createTextNode("\n            ");
        dom.appendChild(el7, el8);
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n            ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("div");
        dom.setAttribute(el7,"class","centered columns");
        var el8 = dom.createTextNode("\n              ");
        dom.appendChild(el7, el8);
        var el8 = dom.createComment("");
        dom.appendChild(el7, el8);
        var el8 = dom.createTextNode("\n            ");
        dom.appendChild(el7, el8);
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n          ");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n        ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element0 = dom.childAt(fragment, [1, 1, 1, 1, 1]);
        var morphs = new Array(4);
        morphs[0] = dom.createElementMorph(element0);
        morphs[1] = dom.createMorphAt(dom.childAt(element0, [1, 1]),1,1);
        morphs[2] = dom.createMorphAt(dom.childAt(element0, [3, 1]),1,1);
        morphs[3] = dom.createMorphAt(dom.childAt(element0, [5, 3]),1,1);
        return morphs;
      },
      statements: [
        ["element","action",["authenticate"],["on","submit"],["loc",[null,[6,14],[6,51]]]],
        ["inline","input",[],["name","email","placeholder","email","value",["subexpr","@mut",[["get","identification",["loc",[null,[9,61],[9,75]]]]],[],[]]],["loc",[null,[9,12],[9,77]]]],
        ["inline","input",[],["name","password","placeholder","password","type","password","value",["subexpr","@mut",[["get","password",["loc",[null,[14,81],[14,89]]]]],[],[]]],["loc",[null,[14,12],[14,91]]]],
        ["block","link-to",["signup"],[],0,null,["loc",[null,[22,14],[22,54]]]]
      ],
      locals: [],
      templates: [child0]
    };
  }()));

});
define('ember-mongo/templates/profile', ['exports'], function (exports) {

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
            "line": 19,
            "column": 0
          }
        },
        "moduleName": "ember-mongo/templates/profile.hbs"
      },
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","row");
        var el2 = dom.createTextNode("\n	");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","row");
        var el2 = dom.createTextNode("\n	");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","row");
        var el2 = dom.createTextNode("\n	");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("ul");
        var el2 = dom.createTextNode("\n      ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("li");
        var el3 = dom.createElement("a");
        dom.setAttribute(el3,"href","");
        var el4 = dom.createElement("i");
        dom.setAttribute(el4,"class","fi-telephone");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n      ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("li");
        var el3 = dom.createElement("a");
        dom.setAttribute(el3,"href","");
        var el4 = dom.createElement("i");
        dom.setAttribute(el4,"class","fi-social-linkedin");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n      ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("li");
        var el3 = dom.createElement("a");
        dom.setAttribute(el3,"href","");
        var el4 = dom.createElement("i");
        dom.setAttribute(el4,"class","fi-social-twitter");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n      ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("li");
        var el3 = dom.createElement("a");
        dom.setAttribute(el3,"href","");
        var el4 = dom.createElement("i");
        dom.setAttribute(el4,"class","fi-social-facebook");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var morphs = new Array(4);
        morphs[0] = dom.createMorphAt(dom.childAt(fragment, [0]),1,1);
        morphs[1] = dom.createMorphAt(dom.childAt(fragment, [2]),1,1);
        morphs[2] = dom.createMorphAt(dom.childAt(fragment, [4]),1,1);
        morphs[3] = dom.createMorphAt(fragment,8,8,contextualElement);
        return morphs;
      },
      statements: [
        ["content","model.name",["loc",[null,[2,1],[2,15]]]],
        ["content","model.email",["loc",[null,[5,1],[5,16]]]],
        ["content","model.avatar",["loc",[null,[8,1],[8,17]]]],
        ["content","outlet",["loc",[null,[18,0],[18,10]]]]
      ],
      locals: [],
      templates: []
    };
  }()));

});
define('ember-mongo/templates/signup', ['exports'], function (exports) {

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
            "line": 42,
            "column": 0
          }
        },
        "moduleName": "ember-mongo/templates/signup.hbs"
      },
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","small-8 medium-4 large-3 small-centered medium-centered large-centered columns");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","login-box");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","row");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","columns");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("form");
        var el6 = dom.createTextNode("\n           ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("div");
        dom.setAttribute(el6,"class","row");
        var el7 = dom.createTextNode("\n             ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("div");
        dom.setAttribute(el7,"class","columns");
        var el8 = dom.createTextNode("\n    	  		   ");
        dom.appendChild(el7, el8);
        var el8 = dom.createComment("");
        dom.appendChild(el7, el8);
        var el8 = dom.createTextNode("\n             ");
        dom.appendChild(el7, el8);
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n          ");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n           ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("div");
        dom.setAttribute(el6,"class","row");
        var el7 = dom.createTextNode("\n             ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("div");
        dom.setAttribute(el7,"class","columns");
        var el8 = dom.createTextNode("\n    	  		   ");
        dom.appendChild(el7, el8);
        var el8 = dom.createComment("");
        dom.appendChild(el7, el8);
        var el8 = dom.createTextNode("\n             ");
        dom.appendChild(el7, el8);
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n           ");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("div");
        dom.setAttribute(el6,"class","row");
        var el7 = dom.createTextNode("\n             ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("div");
        dom.setAttribute(el7,"class","columns");
        var el8 = dom.createTextNode("\n    	  		   ");
        dom.appendChild(el7, el8);
        var el8 = dom.createComment("");
        dom.appendChild(el7, el8);
        var el8 = dom.createTextNode("\n             ");
        dom.appendChild(el7, el8);
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n          ");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("div");
        dom.setAttribute(el6,"class","row");
        var el7 = dom.createTextNode("\n             ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("div");
        dom.setAttribute(el7,"class","columns");
        var el8 = dom.createTextNode("\n    	  		   ");
        dom.appendChild(el7, el8);
        var el8 = dom.createComment("");
        dom.appendChild(el7, el8);
        var el8 = dom.createTextNode("\n             ");
        dom.appendChild(el7, el8);
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n          ");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("div");
        dom.setAttribute(el6,"class","row");
        var el7 = dom.createTextNode("\n             ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("div");
        dom.setAttribute(el7,"class","columns");
        var el8 = dom.createTextNode("\n    	  		   ");
        dom.appendChild(el7, el8);
        var el8 = dom.createComment("");
        dom.appendChild(el7, el8);
        var el8 = dom.createTextNode("\n             ");
        dom.appendChild(el7, el8);
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n          ");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n           ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("div");
        dom.setAttribute(el6,"class","row");
        var el7 = dom.createTextNode("\n            ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("div");
        dom.setAttribute(el7,"class","centered columns");
        var el8 = dom.createTextNode("\n              ");
        dom.appendChild(el7, el8);
        var el8 = dom.createElement("input");
        dom.setAttribute(el8,"type","submit");
        dom.setAttribute(el8,"class","expand button");
        dom.setAttribute(el8,"value","Sign Up");
        dom.appendChild(el7, el8);
        var el8 = dom.createTextNode("\n            ");
        dom.appendChild(el7, el8);
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n          ");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n        ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element0 = dom.childAt(fragment, [1, 1, 1, 1, 1]);
        var morphs = new Array(6);
        morphs[0] = dom.createElementMorph(element0);
        morphs[1] = dom.createMorphAt(dom.childAt(element0, [1, 1]),1,1);
        morphs[2] = dom.createMorphAt(dom.childAt(element0, [3, 1]),1,1);
        morphs[3] = dom.createMorphAt(dom.childAt(element0, [5, 1]),1,1);
        morphs[4] = dom.createMorphAt(dom.childAt(element0, [7, 1]),1,1);
        morphs[5] = dom.createMorphAt(dom.childAt(element0, [9, 1]),1,1);
        return morphs;
      },
      statements: [
        ["element","action",["signup"],["on","submit"],["loc",[null,[6,14],[6,45]]]],
        ["inline","input",[],["name","name","placeholder","name","value",["subexpr","@mut",[["get","name",["loc",[null,[9,58],[9,62]]]]],[],[]]],["loc",[null,[9,12],[9,64]]]],
        ["inline","input",[],["id","email","placeholder","email","value",["subexpr","@mut",[["get","email",["loc",[null,[14,57],[14,62]]]]],[],[]]],["loc",[null,[14,12],[14,64]]]],
        ["inline","input",[],["name","password","placeholder","password","type","password","value",["subexpr","@mut",[["get","password",["loc",[null,[19,81],[19,89]]]]],[],[]]],["loc",[null,[19,12],[19,91]]]],
        ["inline","input",[],["placeholder","veriffy password","type","password","value",["subexpr","@mut",[["get","verifypw",["loc",[null,[24,74],[24,82]]]]],[],[]]],["loc",[null,[24,12],[24,84]]]],
        ["inline","input",[],["name","avatar","placeholder","avatar url","value",["subexpr","@mut",[["get","avatar",["loc",[null,[29,66],[29,72]]]]],[],[]]],["loc",[null,[29,12],[29,74]]]]
      ],
      locals: [],
      templates: []
    };
  }()));

});
define('ember-mongo/tests/adapters/application.jshint', function () {

  'use strict';

  QUnit.module('JSHint - adapters');
  QUnit.test('adapters/application.js should pass jshint', function(assert) { 
    assert.ok(false, 'adapters/application.js should pass jshint.\nadapters/application.js: line 2, col 40, Missing semicolon.\n\n1 error'); 
  });

});
define('ember-mongo/tests/app.jshint', function () {

  'use strict';

  QUnit.module('JSHint - .');
  QUnit.test('app.js should pass jshint', function(assert) { 
    assert.ok(true, 'app.js should pass jshint.'); 
  });

});
define('ember-mongo/tests/components/image-upload.jshint', function () {

  'use strict';

  QUnit.module('JSHint - components');
  QUnit.test('components/image-upload.js should pass jshint', function(assert) { 
    assert.ok(false, 'components/image-upload.js should pass jshint.\ncomponents/image-upload.js: line 57, col 81, Missing semicolon.\ncomponents/image-upload.js: line 64, col 12, Missing semicolon.\ncomponents/image-upload.js: line 100, col 15, Forgotten \'debugger\' statement?\ncomponents/image-upload.js: line 100, col 23, Missing semicolon.\ncomponents/image-upload.js: line 101, col 85, Missing semicolon.\ncomponents/image-upload.js: line 224, col 15, \'store\' is not defined.\ncomponents/image-upload.js: line 225, col 15, \'store\' is not defined.\ncomponents/image-upload.js: line 235, col 14, \'flashMessages\' is not defined.\ncomponents/image-upload.js: line 239, col 11, \'flashMessages\' is not defined.\ncomponents/image-upload.js: line 41, col 53, \'reject\' is defined but never used.\ncomponents/image-upload.js: line 148, col 11, \'fileId\' is defined but never used.\ncomponents/image-upload.js: line 147, col 26, \'file\' is defined but never used.\ncomponents/image-upload.js: line 233, col 21, \'err\' is defined but never used.\ncomponents/image-upload.js: line 262, col 9, \'_this\' is defined but never used.\n\n14 errors'); 
  });

});
define('ember-mongo/tests/controllers/index.jshint', function () {

  'use strict';

  QUnit.module('JSHint - controllers');
  QUnit.test('controllers/index.js should pass jshint', function(assert) { 
    assert.ok(false, 'controllers/index.js should pass jshint.\ncontrollers/index.js: line 10, col 57, Missing semicolon.\ncontrollers/index.js: line 15, col 62, Missing semicolon.\ncontrollers/index.js: line 36, col 42, Missing semicolon.\ncontrollers/index.js: line 17, col 17, \'_this\' is defined but never used.\ncontrollers/index.js: line 19, col 27, \'note\' is defined but never used.\ncontrollers/index.js: line 40, col 17, \'_this\' is defined but never used.\n\n6 errors'); 
  });

});
define('ember-mongo/tests/controllers/login.jshint', function () {

  'use strict';

  QUnit.module('JSHint - controllers');
  QUnit.test('controllers/login.js should pass jshint', function(assert) { 
    assert.ok(true, 'controllers/login.js should pass jshint.'); 
  });

});
define('ember-mongo/tests/controllers/signup.jshint', function () {

  'use strict';

  QUnit.module('JSHint - controllers');
  QUnit.test('controllers/signup.js should pass jshint', function(assert) { 
    assert.ok(false, 'controllers/signup.js should pass jshint.\ncontrollers/signup.js: line 26, col 24, Unnecessary semicolon.\n\n1 error'); 
  });

});
define('ember-mongo/tests/helpers/flash-message', ['ember-cli-flash/flash/object'], function (FlashObject) {

	'use strict';

	FlashObject['default'].reopen({ _setInitialState: null });

});
define('ember-mongo/tests/helpers/flash-message.jshint', function () {

  'use strict';

  QUnit.module('JSHint - helpers');
  QUnit.test('helpers/flash-message.js should pass jshint', function(assert) { 
    assert.ok(true, 'helpers/flash-message.js should pass jshint.'); 
  });

});
define('ember-mongo/tests/helpers/resolver', ['exports', 'ember/resolver', 'ember-mongo/config/environment'], function (exports, Resolver, config) {

  'use strict';

  var resolver = Resolver['default'].create();

  resolver.namespace = {
    modulePrefix: config['default'].modulePrefix,
    podModulePrefix: config['default'].podModulePrefix
  };

  exports['default'] = resolver;

});
define('ember-mongo/tests/helpers/resolver.jshint', function () {

  'use strict';

  QUnit.module('JSHint - helpers');
  QUnit.test('helpers/resolver.js should pass jshint', function(assert) { 
    assert.ok(true, 'helpers/resolver.js should pass jshint.'); 
  });

});
define('ember-mongo/tests/helpers/start-app', ['exports', 'ember', 'ember-mongo/app', 'ember-mongo/config/environment'], function (exports, Ember, Application, config) {

  'use strict';



  exports['default'] = startApp;
  function startApp(attrs) {
    var application;

    var attributes = Ember['default'].merge({}, config['default'].APP);
    attributes = Ember['default'].merge(attributes, attrs); // use defaults, but you can override;

    Ember['default'].run(function () {
      application = Application['default'].create(attributes);
      application.setupForTesting();
      application.injectTestHelpers();
    });

    return application;
  }

});
define('ember-mongo/tests/helpers/start-app.jshint', function () {

  'use strict';

  QUnit.module('JSHint - helpers');
  QUnit.test('helpers/start-app.js should pass jshint', function(assert) { 
    assert.ok(true, 'helpers/start-app.js should pass jshint.'); 
  });

});
define('ember-mongo/tests/models/note.jshint', function () {

  'use strict';

  QUnit.module('JSHint - models');
  QUnit.test('models/note.js should pass jshint', function(assert) { 
    assert.ok(true, 'models/note.js should pass jshint.'); 
  });

});
define('ember-mongo/tests/models/user.jshint', function () {

  'use strict';

  QUnit.module('JSHint - models');
  QUnit.test('models/user.js should pass jshint', function(assert) { 
    assert.ok(true, 'models/user.js should pass jshint.'); 
  });

});
define('ember-mongo/tests/router.jshint', function () {

  'use strict';

  QUnit.module('JSHint - .');
  QUnit.test('router.js should pass jshint', function(assert) { 
    assert.ok(true, 'router.js should pass jshint.'); 
  });

});
define('ember-mongo/tests/routes/about.jshint', function () {

  'use strict';

  QUnit.module('JSHint - routes');
  QUnit.test('routes/about.js should pass jshint', function(assert) { 
    assert.ok(true, 'routes/about.js should pass jshint.'); 
  });

});
define('ember-mongo/tests/routes/application.jshint', function () {

  'use strict';

  QUnit.module('JSHint - routes');
  QUnit.test('routes/application.js should pass jshint', function(assert) { 
    assert.ok(true, 'routes/application.js should pass jshint.'); 
  });

});
define('ember-mongo/tests/routes/contact.jshint', function () {

  'use strict';

  QUnit.module('JSHint - routes');
  QUnit.test('routes/contact.js should pass jshint', function(assert) { 
    assert.ok(true, 'routes/contact.js should pass jshint.'); 
  });

});
define('ember-mongo/tests/routes/index.jshint', function () {

  'use strict';

  QUnit.module('JSHint - routes');
  QUnit.test('routes/index.js should pass jshint', function(assert) { 
    assert.ok(false, 'routes/index.js should pass jshint.\nroutes/index.js: line 16, col 21, Missing semicolon.\n\n1 error'); 
  });

});
define('ember-mongo/tests/routes/login.jshint', function () {

  'use strict';

  QUnit.module('JSHint - routes');
  QUnit.test('routes/login.js should pass jshint', function(assert) { 
    assert.ok(true, 'routes/login.js should pass jshint.'); 
  });

});
define('ember-mongo/tests/routes/profile.jshint', function () {

  'use strict';

  QUnit.module('JSHint - routes');
  QUnit.test('routes/profile.js should pass jshint', function(assert) { 
    assert.ok(true, 'routes/profile.js should pass jshint.'); 
  });

});
define('ember-mongo/tests/routes/signup.jshint', function () {

  'use strict';

  QUnit.module('JSHint - routes');
  QUnit.test('routes/signup.js should pass jshint', function(assert) { 
    assert.ok(true, 'routes/signup.js should pass jshint.'); 
  });

});
define('ember-mongo/tests/serializers/application.jshint', function () {

  'use strict';

  QUnit.module('JSHint - serializers');
  QUnit.test('serializers/application.js should pass jshint', function(assert) { 
    assert.ok(true, 'serializers/application.js should pass jshint.'); 
  });

});
define('ember-mongo/tests/test-helper', ['ember-mongo/tests/helpers/resolver', 'ember-mongo/tests/helpers/flash-message', 'ember-qunit'], function (resolver, __dep1__, ember_qunit) {

	'use strict';

	ember_qunit.setResolver(resolver['default']);

});
define('ember-mongo/tests/test-helper.jshint', function () {

  'use strict';

  QUnit.module('JSHint - .');
  QUnit.test('test-helper.js should pass jshint', function(assert) { 
    assert.ok(true, 'test-helper.js should pass jshint.'); 
  });

});
define('ember-mongo/tests/unit/adapters/application-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor('adapter:application', 'Unit | Adapter | application', {
    // Specify the other units that are required for this test.
    // needs: ['serializer:foo']
  });

  // Replace this with your real tests.
  ember_qunit.test('it exists', function (assert) {
    var adapter = this.subject();
    assert.ok(adapter);
  });

});
define('ember-mongo/tests/unit/adapters/application-test.jshint', function () {

  'use strict';

  QUnit.module('JSHint - unit/adapters');
  QUnit.test('unit/adapters/application-test.js should pass jshint', function(assert) { 
    assert.ok(true, 'unit/adapters/application-test.js should pass jshint.'); 
  });

});
define('ember-mongo/tests/unit/controllers/note-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor('controller:note', {
    // Specify the other units that are required for this test.
    // needs: ['controller:foo']
  });

  // Replace this with your real tests.
  ember_qunit.test('it exists', function (assert) {
    var controller = this.subject();
    assert.ok(controller);
  });

});
define('ember-mongo/tests/unit/controllers/note-test.jshint', function () {

  'use strict';

  QUnit.module('JSHint - unit/controllers');
  QUnit.test('unit/controllers/note-test.js should pass jshint', function(assert) { 
    assert.ok(true, 'unit/controllers/note-test.js should pass jshint.'); 
  });

});
define('ember-mongo/tests/unit/models/note-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleForModel('note', 'Unit | Model | note', {
    // Specify the other units that are required for this test.
    needs: []
  });

  ember_qunit.test('it exists', function (assert) {
    var model = this.subject();
    // var store = this.store();
    assert.ok(!!model);
  });

});
define('ember-mongo/tests/unit/models/note-test.jshint', function () {

  'use strict';

  QUnit.module('JSHint - unit/models');
  QUnit.test('unit/models/note-test.js should pass jshint', function(assert) { 
    assert.ok(true, 'unit/models/note-test.js should pass jshint.'); 
  });

});
define('ember-mongo/tests/unit/models/user-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleForModel('user', 'Unit | Model | user', {
    // Specify the other units that are required for this test.
    needs: []
  });

  ember_qunit.test('it exists', function (assert) {
    var model = this.subject();
    // var store = this.store();
    assert.ok(!!model);
  });

});
define('ember-mongo/tests/unit/models/user-test.jshint', function () {

  'use strict';

  QUnit.module('JSHint - unit/models');
  QUnit.test('unit/models/user-test.js should pass jshint', function(assert) { 
    assert.ok(true, 'unit/models/user-test.js should pass jshint.'); 
  });

});
define('ember-mongo/tests/unit/routes/about-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor('route:about', 'Unit | Route | about', {
    // Specify the other units that are required for this test.
    // needs: ['controller:foo']
  });

  ember_qunit.test('it exists', function (assert) {
    var route = this.subject();
    assert.ok(route);
  });

});
define('ember-mongo/tests/unit/routes/about-test.jshint', function () {

  'use strict';

  QUnit.module('JSHint - unit/routes');
  QUnit.test('unit/routes/about-test.js should pass jshint', function(assert) { 
    assert.ok(true, 'unit/routes/about-test.js should pass jshint.'); 
  });

});
define('ember-mongo/tests/unit/routes/application-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor('route:application', 'Unit | Route | application', {
    // Specify the other units that are required for this test.
    // needs: ['controller:foo']
  });

  ember_qunit.test('it exists', function (assert) {
    var route = this.subject();
    assert.ok(route);
  });

});
define('ember-mongo/tests/unit/routes/application-test.jshint', function () {

  'use strict';

  QUnit.module('JSHint - unit/routes');
  QUnit.test('unit/routes/application-test.js should pass jshint', function(assert) { 
    assert.ok(true, 'unit/routes/application-test.js should pass jshint.'); 
  });

});
define('ember-mongo/tests/unit/routes/contact-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor('route:contact', 'Unit | Route | contact', {
    // Specify the other units that are required for this test.
    // needs: ['controller:foo']
  });

  ember_qunit.test('it exists', function (assert) {
    var route = this.subject();
    assert.ok(route);
  });

});
define('ember-mongo/tests/unit/routes/contact-test.jshint', function () {

  'use strict';

  QUnit.module('JSHint - unit/routes');
  QUnit.test('unit/routes/contact-test.js should pass jshint', function(assert) { 
    assert.ok(true, 'unit/routes/contact-test.js should pass jshint.'); 
  });

});
define('ember-mongo/tests/unit/routes/index-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor('route:index', 'Unit | Route | index', {
    // Specify the other units that are required for this test.
    // needs: ['controller:foo']
  });

  ember_qunit.test('it exists', function (assert) {
    var route = this.subject();
    assert.ok(route);
  });

});
define('ember-mongo/tests/unit/routes/index-test.jshint', function () {

  'use strict';

  QUnit.module('JSHint - unit/routes');
  QUnit.test('unit/routes/index-test.js should pass jshint', function(assert) { 
    assert.ok(true, 'unit/routes/index-test.js should pass jshint.'); 
  });

});
define('ember-mongo/tests/unit/routes/login-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor('route:login', 'Unit | Route | login', {
    // Specify the other units that are required for this test.
    // needs: ['controller:foo']
  });

  ember_qunit.test('it exists', function (assert) {
    var route = this.subject();
    assert.ok(route);
  });

});
define('ember-mongo/tests/unit/routes/login-test.jshint', function () {

  'use strict';

  QUnit.module('JSHint - unit/routes');
  QUnit.test('unit/routes/login-test.js should pass jshint', function(assert) { 
    assert.ok(true, 'unit/routes/login-test.js should pass jshint.'); 
  });

});
define('ember-mongo/tests/unit/routes/profile-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor('route:profile', 'Unit | Route | profile', {
    // Specify the other units that are required for this test.
    // needs: ['controller:foo']
  });

  ember_qunit.test('it exists', function (assert) {
    var route = this.subject();
    assert.ok(route);
  });

});
define('ember-mongo/tests/unit/routes/profile-test.jshint', function () {

  'use strict';

  QUnit.module('JSHint - unit/routes');
  QUnit.test('unit/routes/profile-test.js should pass jshint', function(assert) { 
    assert.ok(true, 'unit/routes/profile-test.js should pass jshint.'); 
  });

});
define('ember-mongo/tests/unit/routes/signup-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor('route:signup', 'Unit | Route | signup', {
    // Specify the other units that are required for this test.
    // needs: ['controller:foo']
  });

  ember_qunit.test('it exists', function (assert) {
    var route = this.subject();
    assert.ok(route);
  });

});
define('ember-mongo/tests/unit/routes/signup-test.jshint', function () {

  'use strict';

  QUnit.module('JSHint - unit/routes');
  QUnit.test('unit/routes/signup-test.js should pass jshint', function(assert) { 
    assert.ok(true, 'unit/routes/signup-test.js should pass jshint.'); 
  });

});
define('ember-mongo/tests/unit/serializers/application-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleForModel('application', 'Unit | Serializer | application', {
    // Specify the other units that are required for this test.
    needs: ['serializer:application']
  });

  // Replace this with your real tests.
  ember_qunit.test('it serializes records', function (assert) {
    var record = this.subject();

    var serializedRecord = record.serialize();

    assert.ok(serializedRecord);
  });

});
define('ember-mongo/tests/unit/serializers/application-test.jshint', function () {

  'use strict';

  QUnit.module('JSHint - unit/serializers');
  QUnit.test('unit/serializers/application-test.js should pass jshint', function(assert) { 
    assert.ok(true, 'unit/serializers/application-test.js should pass jshint.'); 
  });

});
define('ember-mongo/utils/computed', ['exports', 'ember-cli-flash/utils/computed'], function (exports, computed) {

	'use strict';



	exports['default'] = computed['default'];

});
define('ember-mongo/utils/object-compact', ['exports', 'ember-cli-flash/utils/object-compact'], function (exports, object_compact) {

	'use strict';



	exports['default'] = object_compact['default'];

});
define('ember-mongo/utils/object-only', ['exports', 'ember-cli-flash/utils/object-only'], function (exports, object_only) {

	'use strict';



	exports['default'] = object_only['default'];

});
define('ember-mongo/utils/object-without', ['exports', 'ember-cli-flash/utils/object-without'], function (exports, object_without) {

	'use strict';



	exports['default'] = object_without['default'];

});
/* jshint ignore:start */

/* jshint ignore:end */

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
  require("ember-mongo/app")["default"].create({"name":"ember-mongo","version":"0.0.0+02ac717b"});
}

/* jshint ignore:end */
//# sourceMappingURL=ember-mongo.map