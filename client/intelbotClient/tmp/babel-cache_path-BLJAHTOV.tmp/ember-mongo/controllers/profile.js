import Ember from 'ember';

export default Ember.Controller.extend({

	actions: {
		receiveFile: function receiveFile(file) {
			var _this = this;
			debugger;
			var asset = this.store.createRecord('file', {
				image: file,
				imageName: file.name,
				title: 'something'
			});

			asset.save().then(function (asset) {
				console.info(asset.get('imageUrl'));
				var profile = _this.get('model');
				profile.set('avatar', asset.get('imageUrl'));
				debugger;
				profile.save().then(function () {}, function () {});
			}, function (error) {
				console.debug('Upload failed', error);
			}, 'file upload');
		}
	}
});