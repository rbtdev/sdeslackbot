import Ember from 'ember';

export default Ember.Controller.extend({
	isUploading: false,
	isActive: true,
	progress: 0,

	validateFile: function validateFile(file) {
		return new Ember.RSVP.Promise(function (resolve, reject) {
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
		return new Ember.RSVP.Promise(function (resolve, reject) {
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
			Ember.$('#file-upload').on('change', function () {
				_this.send('receiveFile', this.files[0]);
			});
			Ember.$('#file-upload').trigger('click');
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
						Ember.get(_this, 'flashMessages').alert(err);
					});
				}, function (err) {
					_this.set('isUploading', false);
					Ember.get(_this, 'flashMessages').alert(err);
				});
			}
		}
	}
});