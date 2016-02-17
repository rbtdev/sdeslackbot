"use strict";
/* jshint ignore:start */

/* jshint ignore:end */

define('ember-mongo/adapters/application', ['exports', 'ember-data', 'ember-mongo/config/environment'], function (exports, DS, ENV) {

	'use strict';

	exports['default'] = DS['default'].RESTAdapter.extend({
		namespace: ENV['default'].api.apiNameSpace,
		host: ENV['default'].api.apiHost
	});

});
define('ember-mongo/adapters/file', ['exports', 'ember-mongo/adapters/application', 'ember-mongo/mixins/form-data-adapter'], function (exports, ApplicationAdapter, FormDataAdapterMixin) {

	'use strict';

	exports['default'] = ApplicationAdapter['default'].extend(FormDataAdapterMixin['default'], {});

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
define('ember-mongo/components/file-uploader', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Component.extend({
    tagName: 'div',
    classNames: 'uploader dropzone'.w(),
    classNameBindings: 'isDragging isDisabled:is-disabled'.w(),
    attributeBindings: 'data-uploader'.w(),
    'data-uploader': 'true',
    isDisabled: false,

    dragOver: function dragOver(event) {
      // this is needed to avoid the default behaviour from the browser
      event.preventDefault();
    },

    dragEnter: function dragEnter(event) {
      event.preventDefault();
      this.set('isDragging', true);
    },

    dragLeave: function dragLeave(event) {
      event.preventDefault();
      this.set('isDragging', false);
    },

    drop: function drop(event) {
      var file;

      if (!this.get('isDisabled')) {
        event.preventDefault();
        this.set('isDragging', false);

        // only 1 file for now
        file = event.dataTransfer.files[0];
        this.set('isDisabled', true);
        this.sendAction('fileInputChanged', file);
      } else {
        console.error('you can only upload on file at the time');
      }
    },

    didInsertElement: function didInsertElement() {
      var _this = this;

      this.$().on('uploadProgress', function (evt) {
        if (evt.progress === 1) {
          _this.set('isDisabled', false);
        }
        _this.sendAction('uploadProgress', evt.progress);
      });

      // this.$().on('downloadProgress', function(evt){
      //   console.info('progress', evt.progress);
      // });
    }
  });

});
define('ember-mongo/components/flash-message', ['exports', 'ember-cli-flash/components/flash-message'], function (exports, FlashMessage) {

	'use strict';

	exports['default'] = FlashMessage['default'];

});
define('ember-mongo/components/google-map', ['exports', 'ember-google-map/components/google-map'], function (exports, GoogleMapComponent) {

	'use strict';

	exports['default'] = GoogleMapComponent['default'];

});
define('ember-mongo/components/image-upload', ['exports', 'ember', 'ember-mongo/config/environment'], function (exports, Ember, ENV) {

  'use strict';

  exports['default'] = Ember['default'].Component.extend({
    //elementId: 'file-upload-component',
    attachments: [],
    errors: [],
    uploadUrl: ENV['default'].api.apiFileUpload,
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
                imageError = "That is not a supported file type. Choose another file.";
              }
              if (imageError) {
                flashMessages.alert(imageError);
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
        var flashMessages = Ember['default'].get(this, 'flashMessages');

        if (attachments.length < 1) {
          Ember['default'].$('section.errors').show();
          Ember['default'].$('section.errors').text('No file selected for upload.');
          return;
        }

        self.set('isUploading', true);

        var promises = attachments.map(function (file) {
          doFile(file, parseFloat(self.get('minAspectRatio'))).then(function (data) {
            var newFile = self.get('targetObject.store').createRecord('file', {
              fileName: file.name,
              file: data,
              description: "Helloworld"
            });

            newFile.save().then(function (response) {
              self.set('isUploading', false);
              flashMessages.danger('File saved successfully');
            }, function (err) {
              self.set('isUploading', false);
              flashMessages.alert('Unable to upload file');
            });
          }, function (err) {
            flashMessages.alert(err);
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
define('ember-mongo/components/uploaded-file', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Component.extend({
    tagName: 'div',
    classNames: 'asset'.w(),
    file: {},
    progress: (function () {
      var progress = 'width:' + this.get('file.progress') * 100 + '%';
      return progress.htmlSafe();
    }).property('file.progress'),
    isUploading: (function () {
      return this.get('file.progress') !== 1;
    }).property('file.progress')
  });

});
define('ember-mongo/controllers/array', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	exports['default'] = Ember['default'].Controller;

});
define('ember-mongo/controllers/google-map/circle', ['exports', 'ember-google-map/controllers/circle'], function (exports, GoogleMapCircleController) {

	'use strict';

	exports['default'] = GoogleMapCircleController['default'];

});
define('ember-mongo/controllers/google-map/circles', ['exports', 'ember-google-map/controllers/circles'], function (exports, GoogleMapCirclesController) {

	'use strict';

	exports['default'] = GoogleMapCirclesController['default'];

});
define('ember-mongo/controllers/google-map/info-window', ['exports', 'ember-google-map/controllers/info-window'], function (exports, GoogleMapInfoWindowController) {

	'use strict';

	exports['default'] = GoogleMapInfoWindowController['default'];

});
define('ember-mongo/controllers/google-map/info-windows', ['exports', 'ember-google-map/controllers/info-windows'], function (exports, GoogleMapInfoWindowsController) {

	'use strict';

	exports['default'] = GoogleMapInfoWindowsController['default'];

});
define('ember-mongo/controllers/google-map/marker', ['exports', 'ember-google-map/controllers/marker'], function (exports, GoogleMapMarkerController) {

	'use strict';

	exports['default'] = GoogleMapMarkerController['default'];

});
define('ember-mongo/controllers/google-map/markers', ['exports', 'ember-google-map/controllers/markers'], function (exports, GoogleMapMarkersController) {

	'use strict';

	exports['default'] = GoogleMapMarkersController['default'];

});
define('ember-mongo/controllers/google-map/polygon-path', ['exports', 'ember-google-map/controllers/polygon-path'], function (exports, GoogleMapPolygonPathController) {

	'use strict';

	exports['default'] = GoogleMapPolygonPathController['default'];

});
define('ember-mongo/controllers/google-map/polygon', ['exports', 'ember-google-map/controllers/polygon'], function (exports, GoogleMapPolygonController) {

	'use strict';

	exports['default'] = GoogleMapPolygonController['default'];

});
define('ember-mongo/controllers/google-map/polygons', ['exports', 'ember-google-map/controllers/polygons'], function (exports, GoogleMapPolygonsController) {

	'use strict';

	exports['default'] = GoogleMapPolygonsController['default'];

});
define('ember-mongo/controllers/google-map/polyline-path', ['exports', 'ember-google-map/controllers/polyline-path'], function (exports, GoogleMapPolylinePathController) {

	'use strict';

	exports['default'] = GoogleMapPolylinePathController['default'];

});
define('ember-mongo/controllers/google-map/polyline', ['exports', 'ember-google-map/controllers/polyline'], function (exports, GoogleMapPolylineController) {

	'use strict';

	exports['default'] = GoogleMapPolylineController['default'];

});
define('ember-mongo/controllers/google-map/polylines', ['exports', 'ember-google-map/controllers/polylines'], function (exports, GoogleMapPolylinesController) {

	'use strict';

	exports['default'] = GoogleMapPolylinesController['default'];

});
define('ember-mongo/controllers/index', ['exports', 'ember', 'ember-mongo/components/google-map', 'ember-group-by'], function (exports, Ember, google_map, groupBy) {

	'use strict';

	exports['default'] = Ember['default'].Controller.extend({

		locations: groupBy['default']('model', 'area'),

		lat: (function () {
			return this.get('markers')[0].lat;
		}).property('markers'),

		lng: (function () {
			return this.get('markers')[0].lng;
		}).property('markers'),

		zoom: 9,
		type: 'road',
		mapTypes: google_map.MAP_TYPES,

		markers: (function () {
			var locations = this.get('model.content');
			var markers = Ember['default'].A();
			for (var i = 0; i < locations.length; i++) {
				var location = locations[i]._data;
				var marker = {};
				marker.name = location.name;
				marker.mapsUrl = location.mapsUrl;
				marker.intelUrl = location.intelUrl;
				marker.area = location.area;
				marker.infoWindowTemplateName = 'marker-info-window';

				var urlArr = location.intelUrl.split("=");
				var llStr = urlArr[urlArr.length - 1];
				var ll = llStr.split(',');

				marker.lat = parseFloat(ll[0]);
				marker.lng = parseFloat(ll[1]);
				marker.isDraggable = true;
				marker.hasInfoWindow = true;
				marker.infoWindowTemplate = 'marker-info-window';
				markers.pushObject(marker);
			}
			return markers;
		}).property('model'),

		currentLocation: null,
		newLocation: null,
		newName: null,
		area: null,

		clearEdit: function clearEdit() {
			if (this.get('currentLocation')) {
				this.set('currentLocation.isEditing', false);
			}
			this.set('newLocation', null);
		},

		actions: {
			showMap: function showMap() {
				this.set('area', null);
			},

			toggle: function toggle(location) {
				if (this.get('currentLocation')) {
					if (this.get('currentLocation.id') === location.get('id')) {
						location.set('active', false);
						this.set('currentLocation', null);
					} else {
						this.set('currentLocation.active', false);
						location.set('active', true);
						this.set('currentLocation', location);
					}
				} else {
					this.set('currentLocation', location);
					location.set('active', true);
				}
			},

			savePortal: function savePortal(location) {
				var flashQueue = Ember['default'].get(this, 'flashMessages');
				var _this = this;
				location.save().then(function (location) {
					flashQueue.success('Location Saved');
					_this.clearEdit();
					_this.send('reload');
				}, function () {
					flashQueue.alert('Unable to save location');
				});
			},
			addPortal: function addPortal() {
				var location = this.store.createRecord('location', {
					name: null,
					area: this.get('area.value'),
					intelUrl: null,
					mapsUrl: null,
					shortCode: null
				});
				this.set('newLocation', location);
			},
			deletePortal: function deletePortal(location) {
				var _this = this;
				if (confirm("Are you sure you'd like to delete " + location.get('name'))) {
					location.destroyRecord().then(function () {
						_this.send('reload');
						_this.get('area.items').removeObject(location);
						_this.send('showPortals', _this.get('area'));
					});
				}
			},
			cancel: function cancel() {
				this.clearEdit();
			},

			showPortals: function showPortals(area) {
				this.clearEdit();
				this.set("area", area);
				return false;
			},

			editPortal: function editPortal(portal) {
				this.clearEdit();
				this.set('currentLocation', portal);
				portal.set("isEditing", true);
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
define('ember-mongo/controllers/profile', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	exports['default'] = Ember['default'].Controller.extend({
		isUploading: false,
		isActive: true,
		progress: 0,

		validateFile: function validateFile(file) {
			return new Ember['default'].RSVP.Promise(function (resolve, reject) {
				var reader = new FileReader();

				reader.onloadend = function (fileData) {
					var image = new Image();
					image.onload = function () {
						var minAspectRatio = null;
						// access image size here
						var ratio = Math.min(this.width / this.height, this.height / this.width);
						if (minAspectRatio && ratio < minAspectRatio) {
							reject("For best results, choose an image which is close to square.");
						} else {
							resolve();
						}
					};
					image.onerror = function (err) {
						reject("Unable to save avatar.");
					};
					// set image src here to check width/height
					image.src = fileData.target.result;
				};

				reader.onerror = function () {
					reject(reader.error);
				};
				if (file.type.indexOf('image') >= 0) {
					reader.readAsDataURL(file);
				} else {
					reject("Please select an image file");
				}
			});
		},

		saveFile: function saveFile(file) {
			var _this = this;
			return new Ember['default'].RSVP.Promise(function (resolve, reject) {
				;
				var asset = _this.store.createRecord('file', {
					image: file,
					imageName: file.name,
					title: 'something'
				});

				asset.save().then(function (asset) {
					console.info(asset.get('imageUrl'));
					var profile = _this.get('model');
					profile.set('avatar', asset.get('imageUrl'));
					_this.set('isUploading', true);
					profile.save().then(function () {
						resolve();
					}, function () {
						reject('Unable to save profile.');
					});
				}, function (error) {
					reject('Unable to save image.');
				}, 'file upload');
			});
		},

		actions: {
			triggerFileSelection: function triggerFileSelection() {
				var _this = this;
				Ember['default'].$('#file-upload').on('change', function () {
					_this.send('receiveFile', this.files[0]);
				});
				Ember['default'].$('#file-upload').trigger('click');
			},

			uploadProgress: function uploadProgress(progress) {
				debugger;
				this.set('progress', progress);
			},

			receiveFile: function receiveFile(file) {
				if (!file) {
					this.set('isUploading', false);
				} else {

					var _this = this;
					this.validateFile(file).then(function () {
						_this.saveFile(file).then(function () {
							_this.set('isUploading', false);
						}, function (err) {
							_this.set('isUploading', false);
							Ember['default'].get(_this, 'flashMessages').alert(err);
						});
					}, function (err) {
						_this.set('isUploading', false);
						Ember['default'].get(_this, 'flashMessages').alert(err);
					});
				}
			}
		}
	});

});
define('ember-mongo/controllers/signup', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	exports['default'] = Ember['default'].Controller.extend({

		email: "",
		password: "",
		verifypw: "",

		hasEmail: Ember['default'].computed.notEmpty('email'),
		hasPassword: Ember['default'].computed.notEmpty('password'),
		pwIsStrong: Ember['default'].computed.match('password', /^(?=.*\d).{4,12}$/),

		pwIsEqual: (function () {
			return this.get('password') === this.get('verifypw');
		}).property('password', 'verifypw'),

		passwordIsValid: (function () {
			return this.get('hasPassword') && this.get('pwIsEqual') && this.get('pwIsStrong');
		}).property('hasPassword', 'pwIsEqual'),

		isReady: (function () {
			return this.get('hasEmail') && this.get('passwordIsValid');
		}).property('hasEmail', 'passwordIsValid'),

		actions: {
			signup: function signup() {
				if (this.get('isReady')) {
					var _this = this;
					var flashQueue = Ember['default'].get(this, 'flashMessages');
					var user = this.store.createRecord('user', {
						email: this.get('email'),
						password: this.get('password'),
						name: this.get('name'),
						avatar: this.get('avatar')
					});
					user.save().then(function () {
						_this.transitionToRoute('success');
					}, function () {
						flashQueue.alert('Unable to create user');
					});
				}
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
define('ember-mongo/initializers/ember-google-map', ['exports', 'ember-google-map/utils/load-google-map'], function (exports, loadGoogleMap) {

  'use strict';

  exports.initialize = initialize;

  function initialize(container, application) {
    application.register('util:load-google-map', loadGoogleMap['default'], { instantiate: false });
    application.inject('route', 'loadGoogleMap', 'util:load-google-map');
  }

  exports['default'] = {
    name: 'ember-google-map',
    initialize: initialize
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
define('ember-mongo/initializers/session-store', ['exports'], function (exports) {

  'use strict';

  exports.initialize = initialize;

  function initialize(container, application) {
    application.inject('session:custom', '_store', 'service:store');

    // "store:main" is highly dynamic depepeding on ember-data version
    // in 1.0.0-beta.19 (June 5, 2015) => "store:application"
    // in 1.13 (June 16, 2015) => "service:store"
  }

  exports['default'] = {
    name: 'session-store',
    after: 'ember-data',
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
define('ember-mongo/initializers/validator-upload', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports.initialize = initialize;

  var UploadValidator = Ember['default'].Object.create({
    execute: function execute(model, property, restrictions) {
      var isValid, acceptedExtensions;

      isValid = false;
      acceptedExtensions = new RegExp("\\.(?:" + restrictions.accept.join('|') + ")$");

      isValid = !!model.get(property).toLocaleLowerCase().match(acceptedExtensions);

      if (!isValid) {
        model.get('errors').add(property, restrictions.message);
      }
    }
  });

  function initialize(container) {
    var validators = container.lookup('service:validators');
    validators.pushObject(Ember['default'].Object.create({
      name: 'file',
      executor: UploadValidator
    }));
  }

  exports['default'] = {
    name: 'validator-upload',
    initialize: initialize
  };

});
define('ember-mongo/mixins/form-data-adapter', ['exports', 'ember', 'ember-data'], function (exports, Ember, DS) {

  'use strict';

  var InvalidError = DS['default'].InvalidError;

  exports['default'] = Ember['default'].Mixin.create({
    // Overwrite to change the request types on which Form Data is sent
    formDataTypes: ['POST', 'PUT', 'PATCH'],

    ajaxOptions: function ajaxOptions(url, type, options) {
      var data;

      if (options && 'data' in options) {
        data = options.data;
      }

      var hash = this._super.apply(this, arguments);

      if (typeof FormData === 'function' && data && this.formDataTypes.contains(type)) {
        var formData, root;

        formData = new FormData();
        root = Ember['default'].keys(data)[0];

        Ember['default'].keys(data[root]).forEach(function (key) {
          if (Ember['default'].isPresent(data[root][key])) {
            formData.append(root + "[" + key + "]", data[root][key]);
          }
        });

        hash.processData = false;
        hash.contentType = false;
        hash.data = formData;
      }

      return hash;
    },

    ajax: function ajax(url, type, options) {
      var adapter = this;

      return new Ember['default'].RSVP.Promise(function (resolve, reject) {
        var hash = adapter.ajaxOptions(url, type, options);

        hash.success = function (payload, textStatus, jqXHR) {
          var response = undefined;

          response = adapter.handleResponse(jqXHR.status, jqXHR.getAllResponseHeaders(), payload);

          if (response instanceof InvalidError) {
            Ember['default'].run(null, reject, response);
          } else {
            Ember['default'].run(null, resolve, response);
          }
        };

        hash.error = function (jqXHR, textStatus, errorThrown) {
          var error = undefined;
          error = adapter.handleResponse(jqXHR.status, jqXHR.getAllResponseHeaders(), adapter.parseErrorResponse(jqXHR.responseText));
          Ember['default'].run(null, reject, error);
        };

        hash.xhr = function () {
          var xhr = new window.XMLHttpRequest();
          //Upload progress
          xhr.upload.addEventListener("progress", function (evt) {
            if (evt.lengthComputable) {
              var percentComplete = evt.loaded / evt.total;
              Ember['default'].$('[data-uploader]').trigger({
                type: "uploadProgress",
                progress: percentComplete
              });
            }
          }, false);
          //Download progress
          xhr.addEventListener("progress", function (evt) {
            if (evt.lengthComputable) {
              var percentComplete = evt.loaded / evt.total;
              Ember['default'].$('[data-uploader]').trigger({
                type: "downloadProgress",
                progress: percentComplete
              });
            }
          }, false);
          return xhr;
        };

        Ember['default'].$.ajax(hash);
      }, "DS: RESTAdapter#ajax " + type + " to " + url);
    }
  });

});
define('ember-mongo/mixins/validation', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Mixin.create({
    validators: Ember['default'].inject.service(),
    init: function init() {
      var properties, validations, _this;

      this._super.apply(this, arguments);

      properties = Ember['default'].keys(this.get('validations'));
      validations = this.get('validations');
      _this = this;

      properties.forEach(function (property) {
        var modelProperty, validationsToExecute;

        modelProperty = validations[property];
        validationsToExecute = Ember['default'].keys(modelProperty);

        validationsToExecute.forEach(function (validation) {
          var validationToExecute, validator;

          validationToExecute = validations[property][validation];
          validator = _this.get('validators').findBy('name', validation);

          _this.addObserver(property, _this, function (model) {
            validator.get('executor').execute(model, property, validationToExecute);
          });
        });
      });
    }

  });

});
define('ember-mongo/models/file', ['exports', 'ember-data', 'ember'], function (exports, DS, Ember) {

  'use strict';

  exports['default'] = DS['default'].Model.extend({
    title: DS['default'].attr('string'),
    image: DS['default'].attr(),
    imageUrl: Ember['default'].computed.alias('image.url'),
    imageName: DS['default'].attr(),
    progress: 0
  });

});
define('ember-mongo/models/location', ['exports', 'ember-data'], function (exports, DS) {

	'use strict';

	exports['default'] = DS['default'].Model.extend({
		name: DS['default'].attr('string'),
		area: DS['default'].attr('string'),
		intelUrl: DS['default'].attr('string'),
		mapsUrl: DS['default'].attr('string'),
		shortCode: DS['default'].attr('string'),
		author: DS['default'].belongsTo('user', { async: true })
	});

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
    avatar: DS['default'].attr(),
    slackName: DS['default'].attr()
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
    this.route('portals');
    this.route('success');
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

  exports['default'] = Ember['default'].Route.extend(AuthenticatedRouteMixin['default'], {
    infiniteIncrementProperty: 'start',
    infiniteIncrementBy: 'limit',
    limit: 5,
    start: 0,
    model: function model() {
      var model = this.store.find('location');
      return model;

      //return this.infiniteQuery('location');
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
define('ember-mongo/routes/portals', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	exports['default'] = Ember['default'].Route.extend({});

});
define('ember-mongo/routes/profile', ['exports', 'ember', 'simple-auth/mixins/authenticated-route-mixin'], function (exports, Ember, AuthenticatedRouteMixin) {

	'use strict';

	exports['default'] = Ember['default'].Route.extend(AuthenticatedRouteMixin['default'], {
		model: function model() {
			return this.get('session.currentUser');
		}
	});

});
define('ember-mongo/routes/signup', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	exports['default'] = Ember['default'].Route.extend({});

});
define('ember-mongo/routes/success', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	exports['default'] = Ember['default'].Route.extend({});

});
define('ember-mongo/serializers/application', ['exports', 'ember-data'], function (exports, DS) {

  'use strict';

  exports['default'] = DS['default'].RESTSerializer.extend({
    normalizeHash: {
      location: function location(hash) {
        hash.id = hash._id.toString();
        delete hash._id;
        return hash;
      },
      user: function user(hash) {
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
define('ember-mongo/services/validators', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].ArrayProxy.extend({
    content: []
  });

});
define('ember-mongo/sessions/custom', ['exports', 'simple-auth/session'], function (exports, Session) {

  'use strict';

  exports['default'] = Session['default'].extend({

    // here _store is ember-data store injected by initializer
    // why "_store"? because "store" is already used by simple-auth as localStorage
    // why initializer? I tried
    // _store: Ember.inject.service('store') and got error

    currentUser: (function () {
      var userId = this.get('secure.userId');
      if (userId && this.get('isAuthenticated')) {
        return this._store.find('user', userId);
      }
    }).property('secure.userId', 'isAuthenticated')

  });

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
                "line": 9,
                "column": 10
              },
              "end": {
                "line": 11,
                "column": 10
              }
            },
            "moduleName": "ember-mongo/templates/application.hbs"
          },
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("            ");
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
            ["attribute","src",["get","session.currentUser.avatar",["loc",[null,[10,33],[10,59]]]]]
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
                "line": 11,
                "column": 10
              },
              "end": {
                "line": 13,
                "column": 9
              }
            },
            "moduleName": "ember-mongo/templates/application.hbs"
          },
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("            ");
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
              "line": 8,
              "column": 8
            },
            "end": {
              "line": 14,
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
          ["block","if",[["get","session.currentUser.avatar",["loc",[null,[9,16],[9,42]]]]],[],0,1,["loc",[null,[9,10],[13,16]]]]
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
              "line": 32,
              "column": 19
            },
            "end": {
              "line": 32,
              "column": 46
            }
          },
          "moduleName": "ember-mongo/templates/application.hbs"
        },
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("Portals");
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
              "line": 35,
              "column": 19
            },
            "end": {
              "line": 35,
              "column": 47
            }
          },
          "moduleName": "ember-mongo/templates/application.hbs"
        },
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("Messages");
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
              "line": 38,
              "column": 19
            },
            "end": {
              "line": 38,
              "column": 47
            }
          },
          "moduleName": "ember-mongo/templates/application.hbs"
        },
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("Events");
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
              "line": 41,
              "column": 6
            },
            "end": {
              "line": 44,
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
          ["element","action",["logout"],[],["loc",[null,[42,24],[42,43]]]]
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
              "line": 44,
              "column": 6
            },
            "end": {
              "line": 47,
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
          ["element","action",["login"],[],["loc",[null,[45,24],[45,42]]]]
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
              "line": 57,
              "column": 6
            },
            "end": {
              "line": 61,
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
          ["inline","flash-message",[],["flash",["subexpr","@mut",[["get","flash",["loc",[null,[59,32],[59,37]]]]],[],[]],"messageStyle","foundation","class","radius"],["loc",[null,[59,10],[59,82]]]]
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
            "line": 69,
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
        var el1 = dom.createTextNode("\n\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("nav");
        dom.setAttribute(el1,"class","top-bar");
        dom.setAttribute(el1,"data-topbar","");
        dom.setAttribute(el1,"role","navigation");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("ul");
        dom.setAttribute(el2,"class","title-area");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("li");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","logo");
        var el5 = dom.createTextNode("\n");
        dom.appendChild(el4, el5);
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n\n       ");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment(" Remove the class \"menu-icon\" to get rid of menu icon. Take out \"Menu\" to just have icon alone ");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n      ");
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
        var el2 = dom.createTextNode("\n\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("section");
        dom.setAttribute(el2,"class","top-bar-section");
        var el3 = dom.createTextNode("\n\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("ul");
        dom.setAttribute(el3,"class","left");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("li");
        dom.setAttribute(el4,"class","slack-name");
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n    ");
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
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n\n\n");
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
        var element4 = dom.childAt(element3, [3]);
        var element5 = dom.childAt(element4, [5]);
        var morphs = new Array(8);
        morphs[0] = dom.createMorphAt(dom.childAt(element3, [1, 1, 1]),1,1);
        morphs[1] = dom.createMorphAt(dom.childAt(element4, [1, 1]),0,0);
        morphs[2] = dom.createMorphAt(dom.childAt(element5, [1]),0,0);
        morphs[3] = dom.createMorphAt(dom.childAt(element5, [5]),0,0);
        morphs[4] = dom.createMorphAt(dom.childAt(element5, [9]),0,0);
        morphs[5] = dom.createMorphAt(element5,13,13);
        morphs[6] = dom.createMorphAt(dom.childAt(fragment, [4, 1, 1]),1,1);
        morphs[7] = dom.createMorphAt(fragment,6,6,contextualElement);
        return morphs;
      },
      statements: [
        ["block","link-to",["profile"],[],0,null,["loc",[null,[8,8],[14,20]]]],
        ["content","session.currentUser.slackName",["loc",[null,[27,31],[27,64]]]],
        ["block","link-to",["index"],[],1,null,["loc",[null,[32,19],[32,58]]]],
        ["block","link-to",["about"],[],2,null,["loc",[null,[35,19],[35,59]]]],
        ["block","link-to",["contact"],[],3,null,["loc",[null,[38,19],[38,59]]]],
        ["block","if",[["get","session.isAuthenticated",["loc",[null,[41,12],[41,35]]]]],[],4,5,["loc",[null,[41,6],[47,13]]]],
        ["block","each",[["get","flashMessages.queue",["loc",[null,[57,14],[57,33]]]]],[],6,null,["loc",[null,[57,6],[61,15]]]],
        ["content","outlet",["loc",[null,[66,0],[66,10]]]]
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
define('ember-mongo/templates/components/google-map', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      var child0 = (function() {
        var child0 = (function() {
          return {
            meta: {
              "revision": "Ember@1.13.7",
              "loc": {
                "source": null,
                "start": {
                  "line": 7,
                  "column": 8
                },
                "end": {
                  "line": 9,
                  "column": 8
                }
              },
              "moduleName": "ember-mongo/templates/components/google-map.hbs"
            },
            arity: 0,
            cachedFragment: null,
            hasRendered: false,
            buildFragment: function buildFragment(dom) {
              var el0 = dom.createDocumentFragment();
              var el1 = dom.createTextNode("          ");
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
              ["inline","view",["google-map/info-window"],["context",["subexpr","@mut",[["get","marker",["loc",[null,[8,50],[8,56]]]]],[],[]]],["loc",[null,[8,10],[8,58]]]]
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
                "line": 5,
                "column": 6
              },
              "end": {
                "line": 10,
                "column": 6
              }
            },
            "moduleName": "ember-mongo/templates/components/google-map.hbs"
          },
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("        ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("li");
            var el2 = dom.createComment("");
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode(" @ ");
            dom.appendChild(el1, el2);
            var el2 = dom.createComment("");
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode(",");
            dom.appendChild(el1, el2);
            var el2 = dom.createComment("");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            var el1 = dom.createComment("");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var element0 = dom.childAt(fragment, [1]);
            var morphs = new Array(4);
            morphs[0] = dom.createMorphAt(element0,0,0);
            morphs[1] = dom.createMorphAt(element0,2,2);
            morphs[2] = dom.createMorphAt(element0,4,4);
            morphs[3] = dom.createMorphAt(fragment,3,3,contextualElement);
            dom.insertBoundary(fragment, null);
            return morphs;
          },
          statements: [
            ["content","marker.title",["loc",[null,[6,12],[6,28]]]],
            ["content","marker.lat",["loc",[null,[6,31],[6,45]]]],
            ["content","marker.lng",["loc",[null,[6,46],[6,60]]]],
            ["block","if",[["get","view.hasInfoWindow",["loc",[null,[7,14],[7,32]]]]],[],0,null,["loc",[null,[7,8],[9,15]]]]
          ],
          locals: [],
          templates: [child0]
        };
      }());
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
              "line": 11,
              "column": 4
            }
          },
          "moduleName": "ember-mongo/templates/components/google-map.hbs"
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
          ["block","view",[["get","markerViewClass",["loc",[null,[5,14],[5,29]]]]],["context",["subexpr","@mut",[["get","marker",["loc",[null,[5,38],[5,44]]]]],[],[]]],0,null,["loc",[null,[5,6],[10,15]]]]
        ],
        locals: ["marker"],
        templates: [child0]
      };
    }());
    var child1 = (function() {
      return {
        meta: {
          "revision": "Ember@1.13.7",
          "loc": {
            "source": null,
            "start": {
              "line": 14,
              "column": 4
            },
            "end": {
              "line": 16,
              "column": 4
            }
          },
          "moduleName": "ember-mongo/templates/components/google-map.hbs"
        },
        arity: 1,
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
          ["inline","view",[["get","infoWindowViewClass",["loc",[null,[15,13],[15,32]]]]],["context",["subexpr","@mut",[["get","iw",["loc",[null,[15,41],[15,43]]]]],[],[]]],["loc",[null,[15,6],[15,45]]]]
        ],
        locals: ["iw"],
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
              "line": 19,
              "column": 4
            },
            "end": {
              "line": 21,
              "column": 4
            }
          },
          "moduleName": "ember-mongo/templates/components/google-map.hbs"
        },
        arity: 1,
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
          ["inline","view",[["get","polylineViewClass",["loc",[null,[20,13],[20,30]]]]],["context",["subexpr","@mut",[["get","polyline",["loc",[null,[20,39],[20,47]]]]],[],[]]],["loc",[null,[20,6],[20,49]]]]
        ],
        locals: ["polyline"],
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
              "line": 24,
              "column": 4
            },
            "end": {
              "line": 26,
              "column": 4
            }
          },
          "moduleName": "ember-mongo/templates/components/google-map.hbs"
        },
        arity: 1,
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
          ["inline","view",[["get","polygonViewClass",["loc",[null,[25,13],[25,29]]]]],["context",["subexpr","@mut",[["get","polygon",["loc",[null,[25,38],[25,45]]]]],[],[]]],["loc",[null,[25,6],[25,47]]]]
        ],
        locals: ["polygon"],
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
              "line": 29,
              "column": 4
            },
            "end": {
              "line": 31,
              "column": 4
            }
          },
          "moduleName": "ember-mongo/templates/components/google-map.hbs"
        },
        arity: 1,
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
          ["inline","view",[["get","circleViewClass",["loc",[null,[30,13],[30,28]]]]],["context",["subexpr","@mut",[["get","circle",["loc",[null,[30,37],[30,43]]]]],[],[]]],["loc",[null,[30,6],[30,45]]]]
        ],
        locals: ["circle"],
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
            "line": 34,
            "column": 0
          }
        },
        "moduleName": "ember-mongo/templates/components/google-map.hbs"
      },
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","map-canvas");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"style","display: none;");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("ul");
        var el3 = dom.createTextNode("\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("ul");
        var el3 = dom.createTextNode("\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("ul");
        var el3 = dom.createTextNode("\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("ul");
        var el3 = dom.createTextNode("\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("ul");
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
        var element1 = dom.childAt(fragment, [2]);
        var morphs = new Array(5);
        morphs[0] = dom.createMorphAt(dom.childAt(element1, [1]),1,1);
        morphs[1] = dom.createMorphAt(dom.childAt(element1, [3]),1,1);
        morphs[2] = dom.createMorphAt(dom.childAt(element1, [5]),1,1);
        morphs[3] = dom.createMorphAt(dom.childAt(element1, [7]),1,1);
        morphs[4] = dom.createMorphAt(dom.childAt(element1, [9]),1,1);
        return morphs;
      },
      statements: [
        ["block","collection",["-legacy-each"],["itemViewClass",["subexpr","@mut",[["get","markerViewClass",["loc",[null,[4,35],[4,50]]]]],[],[]],"content",["subexpr","@mut",[["get","_markers",["loc",[null,[4,12],[4,20]]]]],[],[]]],0,null,["loc",[null,[4,4],[11,13]]]],
        ["block","each",[["get","_infoWindows",["loc",[null,[14,12],[14,24]]]]],[],1,null,["loc",[null,[14,4],[16,13]]]],
        ["block","each",[["get","_polylines",["loc",[null,[19,12],[19,22]]]]],[],2,null,["loc",[null,[19,4],[21,13]]]],
        ["block","each",[["get","_polygons",["loc",[null,[24,12],[24,21]]]]],[],3,null,["loc",[null,[24,4],[26,13]]]],
        ["block","each",[["get","_circles",["loc",[null,[29,12],[29,20]]]]],[],4,null,["loc",[null,[29,4],[31,13]]]]
      ],
      locals: [],
      templates: [child0, child1, child2, child3, child4]
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
define('ember-mongo/templates/components/uploaded-file', ['exports'], function (exports) {

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
                "line": 6,
                "column": 2
              }
            },
            "moduleName": "ember-mongo/templates/components/uploaded-file.hbs"
          },
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("    ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("div");
            dom.setAttribute(el1,"class","progress");
            var el2 = dom.createTextNode("\n      ");
            dom.appendChild(el1, el2);
            var el2 = dom.createElement("div");
            dom.setAttribute(el2,"class","bar");
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n    ");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var element1 = dom.childAt(fragment, [1, 1]);
            var morphs = new Array(1);
            morphs[0] = dom.createAttrMorph(element1, 'style');
            return morphs;
          },
          statements: [
            ["attribute","style",["get","progress",["loc",[null,[4,31],[4,39]]]]]
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
            "moduleName": "ember-mongo/templates/components/uploaded-file.hbs"
          },
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("    ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("span");
            var el2 = dom.createTextNode("loading...");
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
              "line": 9,
              "column": 0
            }
          },
          "moduleName": "ember-mongo/templates/components/uploaded-file.hbs"
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
          ["block","if",[["get","isUploading",["loc",[null,[2,8],[2,19]]]]],[],0,1,["loc",[null,[2,2],[8,9]]]]
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
              "line": 9,
              "column": 0
            },
            "end": {
              "line": 12,
              "column": 0
            }
          },
          "moduleName": "ember-mongo/templates/components/uploaded-file.hbs"
        },
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("img");
          dom.setAttribute(el1,"class","asset-image");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n  ");
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
          var element0 = dom.childAt(fragment, [1]);
          var morphs = new Array(2);
          morphs[0] = dom.createAttrMorph(element0, 'src');
          morphs[1] = dom.createMorphAt(dom.childAt(fragment, [3]),0,0);
          return morphs;
        },
        statements: [
          ["attribute","src",["get","file.imageUrl",["loc",[null,[10,43],[10,56]]]]],
          ["content","file.fileName",["loc",[null,[11,8],[11,25]]]]
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
            "line": 13,
            "column": 0
          }
        },
        "moduleName": "ember-mongo/templates/components/uploaded-file.hbs"
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
        ["block","if",[["get","file.isNew",["loc",[null,[1,6],[1,16]]]]],[],0,1,["loc",[null,[1,0],[12,7]]]]
      ],
      locals: [],
      templates: [child0, child1]
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
define('ember-mongo/templates/google-map/info-window', ['exports'], function (exports) {

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
            "line": 4,
            "column": 0
          }
        },
        "moduleName": "ember-mongo/templates/google-map/info-window.hbs"
      },
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("h3");
        dom.setAttribute(el1,"style","margin-top: 0;");
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("p");
        dom.setAttribute(el1,"style","margin-bottom: 0;");
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var morphs = new Array(2);
        morphs[0] = dom.createMorphAt(dom.childAt(fragment, [0]),0,0);
        morphs[1] = dom.createMorphAt(dom.childAt(fragment, [2]),0,0);
        return morphs;
      },
      statements: [
        ["content","title",["loc",[null,[1,27],[1,36]]]],
        ["content","description",["loc",[null,[3,29],[3,44]]]]
      ],
      locals: [],
      templates: []
    };
  }()));

});
define('ember-mongo/templates/google-map/polyline', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
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
              "line": 4,
              "column": 2
            }
          },
          "moduleName": "ember-mongo/templates/google-map/polyline.hbs"
        },
        arity: 1,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("li");
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode(",");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var element0 = dom.childAt(fragment, [1]);
          var morphs = new Array(2);
          morphs[0] = dom.createMorphAt(element0,0,0);
          morphs[1] = dom.createMorphAt(element0,2,2);
          return morphs;
        },
        statements: [
          ["content","point.lat",["loc",[null,[3,8],[3,21]]]],
          ["content","point.lng",["loc",[null,[3,22],[3,35]]]]
        ],
        locals: ["point"],
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
            "line": 6,
            "column": 0
          }
        },
        "moduleName": "ember-mongo/templates/google-map/polyline.hbs"
      },
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("ul");
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var morphs = new Array(1);
        morphs[0] = dom.createMorphAt(dom.childAt(fragment, [0]),1,1);
        return morphs;
      },
      statements: [
        ["block","each",[["get","_path",["loc",[null,[2,10],[2,15]]]]],[],0,null,["loc",[null,[2,2],[4,11]]]]
      ],
      locals: [],
      templates: [child0]
    };
  }()));

});
define('ember-mongo/templates/index', ['exports'], function (exports) {

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
              "column": 0
            },
            "end": {
              "line": 11,
              "column": 0
            }
          },
          "moduleName": "ember-mongo/templates/index.hbs"
        },
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("	");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1,"class","row");
          var el2 = dom.createTextNode("\n		");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n	");
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
          ["inline","google-map",[],["lat",["subexpr","@mut",[["get","lat",["loc",[null,[7,8],[7,11]]]]],[],[]],"lng",["subexpr","@mut",[["get","lng",["loc",[null,[7,16],[7,19]]]]],[],[]],"zoom",["subexpr","@mut",[["get","zoom",["loc",[null,[7,25],[7,29]]]]],[],[]],"type",["subexpr","@mut",[["get","type",["loc",[null,[7,35],[7,39]]]]],[],[]],"markers",["subexpr","@mut",[["get","markers",["loc",[null,[7,48],[7,55]]]]],[],[]],"gopt_mapTypeControl",false,"gopt_backgroundColor","transparent","ev_click","didClickMap","markerInfoWindowTemplateName","marker-info-window"],["loc",[null,[6,2],[9,80]]]]
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
              "line": 18,
              "column": 2
            },
            "end": {
              "line": 21,
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
          var el1 = dom.createElement("h2");
          var el2 = dom.createTextNode("Portals in ");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n			");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(2);
          morphs[0] = dom.createMorphAt(dom.childAt(fragment, [1]),1,1);
          morphs[1] = dom.createMorphAt(fragment,3,3,contextualElement);
          return morphs;
        },
        statements: [
          ["content","area.value",["loc",[null,[19,18],[19,32]]]],
          ["inline","partial",["partials/portals"],[],["loc",[null,[20,3],[20,33]]]]
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
              "line": 21,
              "column": 2
            },
            "end": {
              "line": 28,
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
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n			");
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
          ["inline","google-map",[],["lat",["subexpr","@mut",[["get","lat",["loc",[null,[24,10],[24,13]]]]],[],[]],"lng",["subexpr","@mut",[["get","lng",["loc",[null,[24,18],[24,21]]]]],[],[]],"zoom",["subexpr","@mut",[["get","zoom",["loc",[null,[24,27],[24,31]]]]],[],[]],"type",["subexpr","@mut",[["get","type",["loc",[null,[24,37],[24,41]]]]],[],[]],"markers",["subexpr","@mut",[["get","markers",["loc",[null,[24,50],[24,57]]]]],[],[]],"gopt_mapTypeControl",false,"gopt_backgroundColor","transparent","ev_click","didClickMap","markerInfoWindowTemplateName","marker-info-window"],["loc",[null,[23,4],[26,82]]]]
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
            "line": 36,
            "column": 0
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
        dom.setAttribute(el1,"class","large-12 column");
        var el2 = dom.createTextNode("\n\n\n");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n	");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","large-2 columns left scrolling");
        var el3 = dom.createTextNode("\n		");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("h2");
        var el4 = dom.createTextNode("Areas");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n		");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n	");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode(" \n	");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","large-10 column left");
        var el3 = dom.createTextNode("\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("	");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element0 = dom.childAt(fragment, [0]);
        var morphs = new Array(4);
        morphs[0] = dom.createMorphAt(element0,1,1);
        morphs[1] = dom.createMorphAt(dom.childAt(element0, [3]),3,3);
        morphs[2] = dom.createMorphAt(dom.childAt(element0, [5]),1,1);
        morphs[3] = dom.createMorphAt(fragment,2,2,contextualElement);
        return morphs;
      },
      statements: [
        ["block","if",[["get","showMap",["loc",[null,[4,6],[4,13]]]]],[],0,null,["loc",[null,[4,0],[11,7]]]],
        ["inline","partial",["partials/areas"],[],["loc",[null,[15,2],[15,30]]]],
        ["block","if",[["get","area",["loc",[null,[18,8],[18,12]]]]],[],1,2,["loc",[null,[18,2],[28,9]]]],
        ["content","outlet",["loc",[null,[33,0],[33,10]]]]
      ],
      locals: [],
      templates: [child0, child1, child2]
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
define('ember-mongo/templates/marker-info-window', ['exports'], function (exports) {

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
            "line": 9,
            "column": 6
          }
        },
        "moduleName": "ember-mongo/templates/marker-info-window.hbs"
      },
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","marker-info-window");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("h3");
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        var el4 = dom.createElement("a");
        dom.setAttribute(el4,"target","Intel");
        var el5 = dom.createTextNode("Intel Map");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        var el4 = dom.createElement("a");
        dom.setAttribute(el4,"target","Maps");
        var el5 = dom.createTextNode("Google Map");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("h4");
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element0 = dom.childAt(fragment, [0]);
        var element1 = dom.childAt(element0, [3]);
        var element2 = dom.childAt(element1, [1, 0]);
        var element3 = dom.childAt(element1, [3, 0]);
        var morphs = new Array(4);
        morphs[0] = dom.createMorphAt(dom.childAt(element0, [1]),0,0);
        morphs[1] = dom.createAttrMorph(element2, 'href');
        morphs[2] = dom.createAttrMorph(element3, 'href');
        morphs[3] = dom.createMorphAt(dom.childAt(element0, [5]),0,0);
        return morphs;
      },
      statements: [
        ["content","model.name",["loc",[null,[2,6],[2,20]]]],
        ["attribute","href",["concat",[["get","model.intelUrl",["loc",[null,[5,20],[5,34]]]]]]],
        ["attribute","href",["concat",[["get","model.mapsUrl",["loc",[null,[6,20],[6,33]]]]]]],
        ["content","model.area",["loc",[null,[8,6],[8,20]]]]
      ],
      locals: [],
      templates: []
    };
  }()));

});
define('ember-mongo/templates/partials/areas', ['exports'], function (exports) {

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
              "column": 1
            },
            "end": {
              "line": 5,
              "column": 3
            }
          },
          "moduleName": "ember-mongo/templates/partials/areas.hbs"
        },
        arity: 1,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("  		");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("li");
          var el2 = dom.createElement("a");
          dom.setAttribute(el2,"href","#");
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var element0 = dom.childAt(fragment, [1, 0]);
          var morphs = new Array(2);
          morphs[0] = dom.createElementMorph(element0);
          morphs[1] = dom.createMorphAt(element0,0,0);
          return morphs;
        },
        statements: [
          ["element","action",["showPortals",["get","area",["loc",[null,[4,45],[4,49]]]]],[],["loc",[null,[4,22],[4,51]]]],
          ["content","area.value",["loc",[null,[4,52],[4,66]]]]
        ],
        locals: ["area"],
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
            "line": 6,
            "column": 5
          }
        },
        "moduleName": "ember-mongo/templates/partials/areas.hbs"
      },
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("ul");
        dom.setAttribute(el1,"class","side-nav");
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var morphs = new Array(1);
        morphs[0] = dom.createMorphAt(dom.childAt(fragment, [1]),1,1);
        return morphs;
      },
      statements: [
        ["block","each",[["get","locations",["loc",[null,[3,9],[3,18]]]]],[],0,null,["loc",[null,[3,1],[5,12]]]]
      ],
      locals: [],
      templates: [child0]
    };
  }()));

});
define('ember-mongo/templates/partials/portals', ['exports'], function (exports) {

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
                "line": 3,
                "column": 2
              },
              "end": {
                "line": 11,
                "column": 2
              }
            },
            "moduleName": "ember-mongo/templates/partials/portals.hbs"
          },
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("			Name ");
            dom.appendChild(el0, el1);
            var el1 = dom.createComment("");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n			Short Code ");
            dom.appendChild(el0, el1);
            var el1 = dom.createComment("");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n			Google Maps URL ");
            dom.appendChild(el0, el1);
            var el1 = dom.createComment("");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n			Intel URL ");
            dom.appendChild(el0, el1);
            var el1 = dom.createComment("");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n			Area ");
            dom.appendChild(el0, el1);
            var el1 = dom.createComment("");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n			");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("button");
            dom.setAttribute(el1,"class","tiny");
            var el2 = dom.createTextNode("Save");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var element7 = dom.childAt(fragment, [11]);
            var morphs = new Array(6);
            morphs[0] = dom.createMorphAt(fragment,1,1,contextualElement);
            morphs[1] = dom.createMorphAt(fragment,3,3,contextualElement);
            morphs[2] = dom.createMorphAt(fragment,5,5,contextualElement);
            morphs[3] = dom.createMorphAt(fragment,7,7,contextualElement);
            morphs[4] = dom.createMorphAt(fragment,9,9,contextualElement);
            morphs[5] = dom.createElementMorph(element7);
            return morphs;
          },
          statements: [
            ["inline","input",[],["type","text","placeholder","Name","value",["subexpr","@mut",[["get","portal.name",["loc",[null,[4,55],[4,66]]]]],[],[]]],["loc",[null,[4,8],[4,68]]]],
            ["inline","input",[],["type","text","placeholder","Short Code","value",["subexpr","@mut",[["get","portal.shortCode",["loc",[null,[5,69],[5,85]]]]],[],[]]],["loc",[null,[5,14],[5,87]]]],
            ["inline","input",[],["type","text","placeholder","Google Maps URL","value",["subexpr","@mut",[["get","portal.mapsUrl",["loc",[null,[6,81],[6,95]]]]],[],[]]],["loc",[null,[6,19],[6,97]]]],
            ["inline","input",[],["type","text","placeholder","Intel URL","value",["subexpr","@mut",[["get","portal.intelUrl",["loc",[null,[7,69],[7,84]]]]],[],[]]],["loc",[null,[7,13],[7,86]]]],
            ["inline","input",[],["type","text","placeholder","Area","value",["subexpr","@mut",[["get","portal.area",["loc",[null,[8,59],[8,70]]]]],[],[]]],["loc",[null,[8,8],[8,72]]]],
            ["element","action",["savePortal",["get","portal",["loc",[null,[9,33],[9,39]]]]],[],["loc",[null,[9,11],[9,41]]]]
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
                  "line": 16,
                  "column": 3
                },
                "end": {
                  "line": 21,
                  "column": 3
                }
              },
              "moduleName": "ember-mongo/templates/partials/portals.hbs"
            },
            arity: 0,
            cachedFragment: null,
            hasRendered: false,
            buildFragment: function buildFragment(dom) {
              var el0 = dom.createDocumentFragment();
              var el1 = dom.createTextNode("				");
              dom.appendChild(el0, el1);
              var el1 = dom.createElement("div");
              dom.setAttribute(el1,"class","large-1 left");
              var el2 = dom.createTextNode("\n					");
              dom.appendChild(el1, el2);
              var el2 = dom.createElement("span");
              dom.setAttribute(el2,"class","icon");
              var el3 = dom.createElement("i");
              dom.setAttribute(el3,"class","fi-pencil");
              dom.appendChild(el2, el3);
              dom.appendChild(el1, el2);
              var el2 = dom.createTextNode("\n					");
              dom.appendChild(el1, el2);
              var el2 = dom.createElement("span");
              dom.setAttribute(el2,"class","icon");
              var el3 = dom.createElement("i");
              dom.setAttribute(el3,"class","fi-x");
              dom.appendChild(el2, el3);
              dom.appendChild(el1, el2);
              var el2 = dom.createTextNode("\n				");
              dom.appendChild(el1, el2);
              dom.appendChild(el0, el1);
              var el1 = dom.createTextNode("\n");
              dom.appendChild(el0, el1);
              return el0;
            },
            buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
              var element2 = dom.childAt(fragment, [1]);
              var element3 = dom.childAt(element2, [1]);
              var element4 = dom.childAt(element2, [3]);
              var morphs = new Array(2);
              morphs[0] = dom.createElementMorph(element3);
              morphs[1] = dom.createElementMorph(element4);
              return morphs;
            },
            statements: [
              ["element","action",["editPortal",["get","portal",["loc",[null,[18,48],[18,54]]]]],[],["loc",[null,[18,26],[18,56]]]],
              ["element","action",["deletePortal",["get","portal",["loc",[null,[19,50],[19,56]]]]],[],["loc",[null,[19,26],[19,58]]]]
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
                "line": 11,
                "column": 2
              },
              "end": {
                "line": 22,
                "column": 2
              }
            },
            "moduleName": "ember-mongo/templates/partials/portals.hbs"
          },
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("			");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("div");
            dom.setAttribute(el1,"class","large-4 column left");
            var el2 = dom.createComment("");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n			");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("div");
            dom.setAttribute(el1,"class","large-1 left");
            var el2 = dom.createTextNode("(");
            dom.appendChild(el1, el2);
            var el2 = dom.createComment("");
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode(")");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n			");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("div");
            dom.setAttribute(el1,"class","large-1 left");
            var el2 = dom.createElement("a");
            dom.setAttribute(el2,"target","google");
            var el3 = dom.createTextNode("Google");
            dom.appendChild(el2, el3);
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n			");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("div");
            dom.setAttribute(el1,"class","large-1 left");
            var el2 = dom.createElement("a");
            dom.setAttribute(el2,"target","inte");
            var el3 = dom.createTextNode("Intel");
            dom.appendChild(el2, el3);
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            var el1 = dom.createComment("");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var element5 = dom.childAt(fragment, [5, 0]);
            var element6 = dom.childAt(fragment, [7, 0]);
            var morphs = new Array(5);
            morphs[0] = dom.createMorphAt(dom.childAt(fragment, [1]),0,0);
            morphs[1] = dom.createMorphAt(dom.childAt(fragment, [3]),1,1);
            morphs[2] = dom.createAttrMorph(element5, 'href');
            morphs[3] = dom.createAttrMorph(element6, 'href');
            morphs[4] = dom.createMorphAt(fragment,9,9,contextualElement);
            dom.insertBoundary(fragment, null);
            return morphs;
          },
          statements: [
            ["content","portal.name",["loc",[null,[12,38],[12,53]]]],
            ["content","portal.shortCode",["loc",[null,[13,32],[13,52]]]],
            ["attribute","href",["get","portal.mapsUrl",["loc",[null,[14,43],[14,57]]]]],
            ["attribute","href",["get","portal.intelUrl",["loc",[null,[15,43],[15,58]]]]],
            ["block","if",[["get","session.currentUser.isAdmin",["loc",[null,[16,9],[16,36]]]]],[],0,null,["loc",[null,[16,3],[21,10]]]]
          ],
          locals: [],
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
              "line": 24,
              "column": 0
            }
          },
          "moduleName": "ember-mongo/templates/partials/portals.hbs"
        },
        arity: 1,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("	");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1,"class","row");
          var el2 = dom.createTextNode("\n");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("	");
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
          ["block","if",[["get","portal.isEditing",["loc",[null,[3,8],[3,24]]]]],[],0,1,["loc",[null,[3,2],[22,9]]]]
        ],
        locals: ["portal"],
        templates: [child0, child1]
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
                "line": 27,
                "column": 1
              },
              "end": {
                "line": 34,
                "column": 1
              }
            },
            "moduleName": "ember-mongo/templates/partials/portals.hbs"
          },
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("		Name ");
            dom.appendChild(el0, el1);
            var el1 = dom.createComment("");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n		Short Code ");
            dom.appendChild(el0, el1);
            var el1 = dom.createComment("");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n		Google Maps URL ");
            dom.appendChild(el0, el1);
            var el1 = dom.createComment("");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n		Intel URL ");
            dom.appendChild(el0, el1);
            var el1 = dom.createComment("");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n		Area ");
            dom.appendChild(el0, el1);
            var el1 = dom.createComment("");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n		");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("button");
            dom.setAttribute(el1,"class","tiny");
            var el2 = dom.createTextNode("Save");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var element1 = dom.childAt(fragment, [11]);
            var morphs = new Array(6);
            morphs[0] = dom.createMorphAt(fragment,1,1,contextualElement);
            morphs[1] = dom.createMorphAt(fragment,3,3,contextualElement);
            morphs[2] = dom.createMorphAt(fragment,5,5,contextualElement);
            morphs[3] = dom.createMorphAt(fragment,7,7,contextualElement);
            morphs[4] = dom.createMorphAt(fragment,9,9,contextualElement);
            morphs[5] = dom.createElementMorph(element1);
            return morphs;
          },
          statements: [
            ["inline","input",[],["type","text","placeholder","Name","value",["subexpr","@mut",[["get","newLocation.name",["loc",[null,[28,54],[28,70]]]]],[],[]]],["loc",[null,[28,7],[28,72]]]],
            ["inline","input",[],["type","text","placeholder","Short Code","value",["subexpr","@mut",[["get","newLocation.shortCode",["loc",[null,[29,68],[29,89]]]]],[],[]]],["loc",[null,[29,13],[29,91]]]],
            ["inline","input",[],["type","text","placeholder","Google Maps URL","value",["subexpr","@mut",[["get","newLocation.mapsUrl",["loc",[null,[30,80],[30,99]]]]],[],[]]],["loc",[null,[30,18],[30,101]]]],
            ["inline","input",[],["type","text","placeholder","Intel URL","value",["subexpr","@mut",[["get","newLocation.intelUrl",["loc",[null,[31,68],[31,88]]]]],[],[]]],["loc",[null,[31,12],[31,90]]]],
            ["inline","input",[],["type","text","placeholder","Area","value",["subexpr","@mut",[["get","newLocation.area",["loc",[null,[32,58],[32,74]]]]],[],[]]],["loc",[null,[32,7],[32,76]]]],
            ["element","action",["savePortal",["get","newLocation",["loc",[null,[33,32],[33,43]]]]],[],["loc",[null,[33,10],[33,45]]]]
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
                "line": 34,
                "column": 1
              },
              "end": {
                "line": 39,
                "column": 1
              }
            },
            "moduleName": "ember-mongo/templates/partials/portals.hbs"
          },
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("		");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("div");
            dom.setAttribute(el1,"class","large-4 column left");
            var el2 = dom.createTextNode("\n			");
            dom.appendChild(el1, el2);
            var el2 = dom.createElement("span");
            dom.setAttribute(el2,"class","icon");
            var el3 = dom.createElement("i");
            dom.setAttribute(el3,"class","fi-plus");
            dom.appendChild(el2, el3);
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n			");
            dom.appendChild(el1, el2);
            var el2 = dom.createElement("span");
            var el3 = dom.createTextNode("Add New Portal");
            dom.appendChild(el2, el3);
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n		");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var element0 = dom.childAt(fragment, [1]);
            var morphs = new Array(1);
            morphs[0] = dom.createElementMorph(element0);
            return morphs;
          },
          statements: [
            ["element","action",["addPortal"],[],["loc",[null,[35,37],[35,59]]]]
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
              "line": 25,
              "column": 0
            },
            "end": {
              "line": 41,
              "column": 0
            }
          },
          "moduleName": "ember-mongo/templates/partials/portals.hbs"
        },
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createElement("div");
          dom.setAttribute(el1,"class","row");
          var el2 = dom.createTextNode("\n");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(dom.childAt(fragment, [0]),1,1);
          return morphs;
        },
        statements: [
          ["block","if",[["get","newLocation",["loc",[null,[27,7],[27,18]]]]],[],0,1,["loc",[null,[27,1],[39,8]]]]
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
            "line": 41,
            "column": 7
          }
        },
        "moduleName": "ember-mongo/templates/partials/portals.hbs"
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
        ["block","each",[["get","area.items",["loc",[null,[1,8],[1,18]]]]],[],0,null,["loc",[null,[1,0],[24,9]]]],
        ["block","if",[["get","session.currentUser.isAdmin",["loc",[null,[25,6],[25,33]]]]],[],1,null,["loc",[null,[25,0],[41,7]]]]
      ],
      locals: [],
      templates: [child0, child1]
    };
  }()));

});
define('ember-mongo/templates/portals', ['exports'], function (exports) {

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
        "moduleName": "ember-mongo/templates/portals.hbs"
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
define('ember-mongo/templates/profile', ['exports'], function (exports) {

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
                "line": 6,
                "column": 9
              },
              "end": {
                "line": 8,
                "column": 8
              }
            },
            "moduleName": "ember-mongo/templates/profile.hbs"
          },
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("				    	");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("img");
            dom.setAttribute(el1,"syle","float:left");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var element1 = dom.childAt(fragment, [1]);
            var morphs = new Array(1);
            morphs[0] = dom.createAttrMorph(element1, 'src');
            return morphs;
          },
          statements: [
            ["attribute","src",["get","session.currentUser.avatar",["loc",[null,[7,50],[7,76]]]]]
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
                "line": 8,
                "column": 8
              },
              "end": {
                "line": 10,
                "column": 9
              }
            },
            "moduleName": "ember-mongo/templates/profile.hbs"
          },
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("				         ");
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
              "line": 4,
              "column": 7
            },
            "end": {
              "line": 13,
              "column": 5
            }
          },
          "moduleName": "ember-mongo/templates/profile.hbs"
        },
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("	  		  	");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          var el2 = dom.createTextNode("\n");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("				");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n		      	");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("input");
          dom.setAttribute(el1,"type","file");
          dom.setAttribute(el1,"id","file-upload");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var element2 = dom.childAt(fragment, [1]);
          var morphs = new Array(2);
          morphs[0] = dom.createElementMorph(element2);
          morphs[1] = dom.createMorphAt(element2,1,1);
          return morphs;
        },
        statements: [
          ["element","action",["triggerFileSelection"],[],["loc",[null,[5,13],[5,46]]]],
          ["block","if",[["get","session.currentUser.avatar",["loc",[null,[6,15],[6,41]]]]],[],0,1,["loc",[null,[6,9],[10,16]]]]
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
              "line": 16,
              "column": 7
            },
            "end": {
              "line": 20,
              "column": 5
            }
          },
          "moduleName": "ember-mongo/templates/profile.hbs"
        },
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("			    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1,"class","progress");
          var el2 = dom.createTextNode("\n			      ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("div");
          dom.setAttribute(el2,"class","bar");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n			    ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var element0 = dom.childAt(fragment, [1, 1]);
          var morphs = new Array(1);
          morphs[0] = dom.createAttrMorph(element0, 'style');
          return morphs;
        },
        statements: [
          ["attribute","style",["get","progress",["loc",[null,[18,44],[18,52]]]]]
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
              "line": 20,
              "column": 5
            },
            "end": {
              "line": 22,
              "column": 5
            }
          },
          "moduleName": "ember-mongo/templates/profile.hbs"
        },
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("			    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("span");
          var el2 = dom.createTextNode("uploading...");
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
            "line": 40,
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
        dom.setAttribute(el1,"id","profile");
        dom.setAttribute(el1,"class","row centered");
        var el2 = dom.createTextNode("\n		");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","column small-6 medium-4 large-3");
        var el3 = dom.createTextNode("\n			");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"id","upload-trigger");
        var el4 = dom.createTextNode("\n");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("  			");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  			");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        var el4 = dom.createTextNode("\n");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("			 ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n		");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n		");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","column small-6 medium-8 large-9");
        var el3 = dom.createTextNode("\n			");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","row");
        var el4 = dom.createTextNode("\n				");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","column");
        var el5 = dom.createTextNode("\n					Name ");
        dom.appendChild(el4, el5);
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n				");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n			");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n			");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","row");
        var el4 = dom.createTextNode("\n				");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","column");
        var el5 = dom.createTextNode("\n					Email ");
        dom.appendChild(el4, el5);
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n				");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n			");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("		\n		");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n	\n	");
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
        var element3 = dom.childAt(fragment, [0]);
        var element4 = dom.childAt(element3, [1]);
        var element5 = dom.childAt(element3, [3]);
        var morphs = new Array(5);
        morphs[0] = dom.createMorphAt(dom.childAt(element4, [1]),1,1);
        morphs[1] = dom.createMorphAt(dom.childAt(element4, [3]),1,1);
        morphs[2] = dom.createMorphAt(dom.childAt(element5, [1, 1]),1,1);
        morphs[3] = dom.createMorphAt(dom.childAt(element5, [3, 1]),1,1);
        morphs[4] = dom.createMorphAt(element3,5,5);
        return morphs;
      },
      statements: [
        ["block","file-uploader",[],["isDisabled",["subexpr","@mut",[["get","controller.isUploading",["loc",[null,[4,35],[4,57]]]]],[],[]],"fileInputChanged","receiveFile","uploadProgress","uploadProgress"],0,null,["loc",[null,[4,7],[13,23]]]],
        ["block","if",[["get","isUploading",["loc",[null,[16,13],[16,24]]]]],[],1,2,["loc",[null,[16,7],[22,12]]]],
        ["inline","input",[],["placeholder","Name","type","text","value",["subexpr","@mut",[["get","model.name",["loc",[null,[28,61],[28,71]]]]],[],[]]],["loc",[null,[28,10],[28,73]]]],
        ["inline","input",[],["placeholder","email","type","text","value",["subexpr","@mut",[["get","model.email",["loc",[null,[33,63],[33,74]]]]],[],[]]],["loc",[null,[33,11],[33,76]]]],
        ["content","outlet",["loc",[null,[38,1],[38,11]]]]
      ],
      locals: [],
      templates: [child0, child1, child2]
    };
  }()));

});
define('ember-mongo/templates/signup', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        meta: {
          "revision": "Ember@1.13.7",
          "loc": {
            "source": null,
            "start": {
              "line": 19,
              "column": 18
            },
            "end": {
              "line": 21,
              "column": 18
            }
          },
          "moduleName": "ember-mongo/templates/signup.hbs"
        },
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("                    4-12 characters, at least 1 number and 1 letter\n");
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
              "line": 29,
              "column": 18
            },
            "end": {
              "line": 31,
              "column": 18
            }
          },
          "moduleName": "ember-mongo/templates/signup.hbs"
        },
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("                    passwords must match\n");
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
            "line": 44,
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
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","small-8 medium-4 large-4 small-centered medium-centered large-centered columns");
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"id","signup-form");
        dom.setAttribute(el2,"class","login-box");
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","row");
        var el4 = dom.createTextNode("\n        ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","columns");
        var el5 = dom.createTextNode("\n          ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("form");
        var el6 = dom.createTextNode("\n             ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("div");
        dom.setAttribute(el6,"class","row");
        var el7 = dom.createTextNode("\n               ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("div");
        dom.setAttribute(el7,"class","large-7 columns left");
        var el8 = dom.createTextNode("\n      	  		   ");
        dom.appendChild(el7, el8);
        var el8 = dom.createComment("");
        dom.appendChild(el7, el8);
        var el8 = dom.createTextNode("\n               ");
        dom.appendChild(el7, el8);
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n               ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("div");
        dom.setAttribute(el7,"class","large-5 columns left note email");
        var el8 = dom.createTextNode("\n                  SDE Slack Email\n               ");
        dom.appendChild(el7, el8);
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n             ");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n            ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("div");
        dom.setAttribute(el6,"class","row");
        var el7 = dom.createTextNode("\n               ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("div");
        dom.setAttribute(el7,"class","large-7 columns left");
        var el8 = dom.createTextNode("\n      	  		   ");
        dom.appendChild(el7, el8);
        var el8 = dom.createComment("");
        dom.appendChild(el7, el8);
        var el8 = dom.createTextNode("\n               ");
        dom.appendChild(el7, el8);
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n               ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("div");
        dom.setAttribute(el7,"class","large-5 columns left note password");
        var el8 = dom.createTextNode("\n");
        dom.appendChild(el7, el8);
        var el8 = dom.createComment("");
        dom.appendChild(el7, el8);
        var el8 = dom.createTextNode("               ");
        dom.appendChild(el7, el8);
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n            ");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n            ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("div");
        dom.setAttribute(el6,"class","row");
        var el7 = dom.createTextNode("\n               ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("div");
        dom.setAttribute(el7,"class","large-7 columns left");
        var el8 = dom.createTextNode("\n      	  		   ");
        dom.appendChild(el7, el8);
        var el8 = dom.createComment("");
        dom.appendChild(el7, el8);
        var el8 = dom.createTextNode("\n               ");
        dom.appendChild(el7, el8);
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n               ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("div");
        dom.setAttribute(el7,"class","large-5 columns left note verifypw");
        var el8 = dom.createTextNode("\n");
        dom.appendChild(el7, el8);
        var el8 = dom.createComment("");
        dom.appendChild(el7, el8);
        var el8 = dom.createTextNode("               ");
        dom.appendChild(el7, el8);
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n            ");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n             ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("div");
        dom.setAttribute(el6,"class","row");
        var el7 = dom.createTextNode("\n              ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("div");
        dom.setAttribute(el7,"class","centered columns");
        var el8 = dom.createTextNode("\n                ");
        dom.appendChild(el7, el8);
        var el8 = dom.createElement("input");
        dom.setAttribute(el8,"type","submit");
        dom.setAttribute(el8,"value","Sign Up");
        dom.appendChild(el7, el8);
        var el8 = dom.createTextNode("\n              ");
        dom.appendChild(el7, el8);
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n            ");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n          ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n          ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n        ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
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
        var element0 = dom.childAt(fragment, [0, 1, 1, 1, 1]);
        var element1 = dom.childAt(element0, [3]);
        var element2 = dom.childAt(element0, [5]);
        var element3 = dom.childAt(element0, [7, 1, 1]);
        var morphs = new Array(7);
        morphs[0] = dom.createElementMorph(element0);
        morphs[1] = dom.createMorphAt(dom.childAt(element0, [1, 1]),1,1);
        morphs[2] = dom.createMorphAt(dom.childAt(element1, [1]),1,1);
        morphs[3] = dom.createMorphAt(dom.childAt(element1, [3]),1,1);
        morphs[4] = dom.createMorphAt(dom.childAt(element2, [1]),1,1);
        morphs[5] = dom.createMorphAt(dom.childAt(element2, [3]),1,1);
        morphs[6] = dom.createAttrMorph(element3, 'class');
        return morphs;
      },
      statements: [
        ["element","action",["signup"],["on","submit"],["loc",[null,[5,16],[5,47]]]],
        ["inline","input",[],["id","email","placeholder","Slack email","value",["subexpr","@mut",[["get","email",["loc",[null,[8,65],[8,70]]]]],[],[]]],["loc",[null,[8,14],[8,72]]]],
        ["inline","input",[],["name","password","placeholder","password","type","password","value",["subexpr","@mut",[["get","password",["loc",[null,[16,83],[16,91]]]]],[],[]]],["loc",[null,[16,14],[16,93]]]],
        ["block","unless",[["get","pwIsStrong",["loc",[null,[19,28],[19,38]]]]],[],0,null,["loc",[null,[19,18],[21,29]]]],
        ["inline","input",[],["placeholder","veriffy password","type","password","value",["subexpr","@mut",[["get","verifypw",["loc",[null,[26,76],[26,84]]]]],[],[]]],["loc",[null,[26,14],[26,86]]]],
        ["block","unless",[["get","pwIsEqual",["loc",[null,[29,28],[29,37]]]]],[],1,null,["loc",[null,[29,18],[31,29]]]],
        ["attribute","class",["concat",["expand"," ","button"," ",["subexpr","if",[["get","isReady",[]],"","disabled"],[],[]]]]]
      ],
      locals: [],
      templates: [child0, child1]
    };
  }()));

});
define('ember-mongo/templates/success', ['exports'], function (exports) {

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
            "line": 15,
            "column": 0
          }
        },
        "moduleName": "ember-mongo/templates/success.hbs"
      },
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","small-8 medium-4 large-4 small-centered medium-centered large-centered columns");
        var el2 = dom.createTextNode("\n	");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","login-box");
        var el3 = dom.createTextNode("\n		");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","row");
        var el4 = dom.createTextNode("\n			");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","large-12 large-centered column");
        var el5 = dom.createTextNode("\n				Your account as been created.  An activation link has been sent to your SD Enlightened Slack account. Please check your \"Slackbot\" channel and click on the link there to complete activation and log in.\n				");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("p");
        var el6 = dom.createTextNode("\n				Thank you!\n				");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n			");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n		");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n	");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var morphs = new Array(1);
        morphs[0] = dom.createMorphAt(fragment,2,2,contextualElement);
        return morphs;
      },
      statements: [
        ["content","outlet",["loc",[null,[14,0],[14,10]]]]
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
define('ember-mongo/tests/adapters/file.jshint', function () {

  'use strict';

  QUnit.module('JSHint - adapters');
  QUnit.test('adapters/file.js should pass jshint', function(assert) { 
    assert.ok(true, 'adapters/file.js should pass jshint.'); 
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
    assert.ok(false, 'components/image-upload.js should pass jshint.\ncomponents/image-upload.js: line 2, col 40, Missing semicolon.\ncomponents/image-upload.js: line 58, col 81, Missing semicolon.\ncomponents/image-upload.js: line 65, col 12, Missing semicolon.\ncomponents/image-upload.js: line 101, col 85, Missing semicolon.\ncomponents/image-upload.js: line 42, col 53, \'reject\' is defined but never used.\ncomponents/image-upload.js: line 148, col 11, \'fileId\' is defined but never used.\ncomponents/image-upload.js: line 147, col 26, \'file\' is defined but never used.\ncomponents/image-upload.js: line 166, col 11, \'callbackFunction\' is defined but never used.\ncomponents/image-upload.js: line 167, col 11, \'processData\' is defined but never used.\ncomponents/image-upload.js: line 168, col 11, \'contentType\' is defined but never used.\ncomponents/image-upload.js: line 189, col 20, \'response\' is defined but never used.\ncomponents/image-upload.js: line 193, col 21, \'err\' is defined but never used.\ncomponents/image-upload.js: line 222, col 9, \'_this\' is defined but never used.\n\n13 errors'); 
  });

});
define('ember-mongo/tests/controllers/index.jshint', function () {

  'use strict';

  QUnit.module('JSHint - controllers');
  QUnit.test('controllers/index.js should pass jshint', function(assert) { 
    assert.ok(false, 'controllers/index.js should pass jshint.\ncontrollers/index.js: line 69, col 54, Missing semicolon.\ncontrollers/index.js: line 74, col 58, Missing semicolon.\ncontrollers/index.js: line 84, col 62, Missing semicolon.\ncontrollers/index.js: line 87, col 27, \'location\' is defined but never used.\n\n4 errors'); 
  });

});
define('ember-mongo/tests/controllers/login.jshint', function () {

  'use strict';

  QUnit.module('JSHint - controllers');
  QUnit.test('controllers/login.js should pass jshint', function(assert) { 
    assert.ok(true, 'controllers/login.js should pass jshint.'); 
  });

});
define('ember-mongo/tests/controllers/profile.jshint', function () {

  'use strict';

  QUnit.module('JSHint - controllers');
  QUnit.test('controllers/profile.js should pass jshint', function(assert) { 
    assert.ok(false, 'controllers/profile.js should pass jshint.\ncontrollers/profile.js: line 17, col 89, Missing semicolon.\ncontrollers/profile.js: line 26, col 53, Missing semicolon.\ncontrollers/profile.js: line 30, col 14, Missing semicolon.\ncontrollers/profile.js: line 39, col 57, Missing semicolon.\ncontrollers/profile.js: line 41, col 11, Missing semicolon.\ncontrollers/profile.js: line 46, col 66, Unnecessary semicolon.\ncontrollers/profile.js: line 61, col 38, Missing semicolon.\ncontrollers/profile.js: line 84, col 13, Forgotten \'debugger\' statement?\ncontrollers/profile.js: line 90, col 47, Missing semicolon.\ncontrollers/profile.js: line 99, col 64, Missing semicolon.\ncontrollers/profile.js: line 102, col 64, Missing semicolon.\ncontrollers/profile.js: line 107, col 56, Missing semicolon.\ncontrollers/profile.js: line 114, col 3, Missing semicolon.\ncontrollers/profile.js: line 25, col 43, \'err\' is defined but never used.\ncontrollers/profile.js: line 68, col 26, \'error\' is defined but never used.\n\n15 errors'); 
  });

});
define('ember-mongo/tests/controllers/signup.jshint', function () {

  'use strict';

  QUnit.module('JSHint - controllers');
  QUnit.test('controllers/signup.js should pass jshint', function(assert) { 
    assert.ok(false, 'controllers/signup.js should pass jshint.\ncontrollers/signup.js: line 14, col 63, Missing semicolon.\n\n1 error'); 
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
define('ember-mongo/tests/initializers/session-store.jshint', function () {

  'use strict';

  QUnit.module('JSHint - initializers');
  QUnit.test('initializers/session-store.js should pass jshint', function(assert) { 
    assert.ok(false, 'initializers/session-store.js should pass jshint.\ninitializers/session-store.js: line 2, col 66, Missing semicolon.\ninitializers/session-store.js: line 13, col 2, Missing semicolon.\n\n2 errors'); 
  });

});
define('ember-mongo/tests/mixins/form-data-adapter.jshint', function () {

  'use strict';

  QUnit.module('JSHint - mixins');
  QUnit.test('mixins/form-data-adapter.js should pass jshint', function(assert) { 
    assert.ok(false, 'mixins/form-data-adapter.js should pass jshint.\nmixins/form-data-adapter.js: line 49, col 17, It\'s not necessary to initialize \'response\' to \'undefined\'.\nmixins/form-data-adapter.js: line 62, col 17, It\'s not necessary to initialize \'error\' to \'undefined\'.\nmixins/form-data-adapter.js: line 61, col 53, \'errorThrown\' is defined but never used.\nmixins/form-data-adapter.js: line 61, col 41, \'textStatus\' is defined but never used.\n\n4 errors'); 
  });

});
define('ember-mongo/tests/models/file.jshint', function () {

  'use strict';

  QUnit.module('JSHint - models');
  QUnit.test('models/file.js should pass jshint', function(assert) { 
    assert.ok(true, 'models/file.js should pass jshint.'); 
  });

});
define('ember-mongo/tests/models/location.jshint', function () {

  'use strict';

  QUnit.module('JSHint - models');
  QUnit.test('models/location.js should pass jshint', function(assert) { 
    assert.ok(true, 'models/location.js should pass jshint.'); 
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
    assert.ok(false, 'routes/index.js should pass jshint.\nroutes/index.js: line 19, col 21, Missing semicolon.\nroutes/index.js: line 3, col 8, \'InfiniteScrollRouteMixin\' is defined but never used.\n\n2 errors'); 
  });

});
define('ember-mongo/tests/routes/login.jshint', function () {

  'use strict';

  QUnit.module('JSHint - routes');
  QUnit.test('routes/login.js should pass jshint', function(assert) { 
    assert.ok(true, 'routes/login.js should pass jshint.'); 
  });

});
define('ember-mongo/tests/routes/portals.jshint', function () {

  'use strict';

  QUnit.module('JSHint - routes');
  QUnit.test('routes/portals.js should pass jshint', function(assert) { 
    assert.ok(true, 'routes/portals.js should pass jshint.'); 
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
define('ember-mongo/tests/routes/success.jshint', function () {

  'use strict';

  QUnit.module('JSHint - routes');
  QUnit.test('routes/success.js should pass jshint', function(assert) { 
    assert.ok(true, 'routes/success.js should pass jshint.'); 
  });

});
define('ember-mongo/tests/serializers/application.jshint', function () {

  'use strict';

  QUnit.module('JSHint - serializers');
  QUnit.test('serializers/application.js should pass jshint', function(assert) { 
    assert.ok(true, 'serializers/application.js should pass jshint.'); 
  });

});
define('ember-mongo/tests/sessions/custom.jshint', function () {

  'use strict';

  QUnit.module('JSHint - sessions');
  QUnit.test('sessions/custom.js should pass jshint', function(assert) { 
    assert.ok(true, 'sessions/custom.js should pass jshint.'); 
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
define('ember-mongo/tests/unit/routes/locations-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor('route:locations', 'Unit | Route | locations', {
    // Specify the other units that are required for this test.
    // needs: ['controller:foo']
  });

  ember_qunit.test('it exists', function (assert) {
    var route = this.subject();
    assert.ok(route);
  });

});
define('ember-mongo/tests/unit/routes/locations-test.jshint', function () {

  'use strict';

  QUnit.module('JSHint - unit/routes');
  QUnit.test('unit/routes/locations-test.js should pass jshint', function(assert) { 
    assert.ok(true, 'unit/routes/locations-test.js should pass jshint.'); 
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
define('ember-mongo/tests/unit/routes/portals-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor('route:portals', 'Unit | Route | portals', {
    // Specify the other units that are required for this test.
    // needs: ['controller:foo']
  });

  ember_qunit.test('it exists', function (assert) {
    var route = this.subject();
    assert.ok(route);
  });

});
define('ember-mongo/tests/unit/routes/portals-test.jshint', function () {

  'use strict';

  QUnit.module('JSHint - unit/routes');
  QUnit.test('unit/routes/portals-test.js should pass jshint', function(assert) { 
    assert.ok(true, 'unit/routes/portals-test.js should pass jshint.'); 
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
define('ember-mongo/tests/unit/routes/success-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor('route:success', 'Unit | Route | success', {
    // Specify the other units that are required for this test.
    // needs: ['controller:foo']
  });

  ember_qunit.test('it exists', function (assert) {
    var route = this.subject();
    assert.ok(route);
  });

});
define('ember-mongo/tests/unit/routes/success-test.jshint', function () {

  'use strict';

  QUnit.module('JSHint - unit/routes');
  QUnit.test('unit/routes/success-test.js should pass jshint', function(assert) { 
    assert.ok(true, 'unit/routes/success-test.js should pass jshint.'); 
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
define('ember-mongo/views/google-map/circle', ['exports', 'ember-google-map/views/circle'], function (exports, GoogleMapCircleView) {

	'use strict';

	exports['default'] = GoogleMapCircleView['default'];

});
define('ember-mongo/views/google-map/core', ['exports', 'ember-google-map/views/core'], function (exports, GoogleMapCoreView) {

	'use strict';

	exports['default'] = GoogleMapCoreView['default'];

});
define('ember-mongo/views/google-map/info-window', ['exports', 'ember-google-map/views/info-window'], function (exports, GoogleMapInfoWindowView) {

	'use strict';

	exports['default'] = GoogleMapInfoWindowView['default'];

});
define('ember-mongo/views/google-map/marker', ['exports', 'ember-google-map/views/marker'], function (exports, GoogleMapMarkerView) {

	'use strict';

	exports['default'] = GoogleMapMarkerView['default'];

});
define('ember-mongo/views/google-map/polygon', ['exports', 'ember-google-map/views/polygon'], function (exports, GoogleMapPolygonView) {

	'use strict';

	exports['default'] = GoogleMapPolygonView['default'];

});
define('ember-mongo/views/google-map/polyline', ['exports', 'ember-google-map/views/polyline'], function (exports, GoogleMapPolylineView) {

	'use strict';

	exports['default'] = GoogleMapPolylineView['default'];

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
  require("ember-mongo/app")["default"].create({"name":"ember-mongo","version":"0.0.0+55951a4c"});
}

/* jshint ignore:end */
//# sourceMappingURL=ember-mongo.map