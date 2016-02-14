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