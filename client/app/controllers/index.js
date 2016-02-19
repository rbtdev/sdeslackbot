import Ember from 'ember';
import {MAP_TYPES} from '../components/google-map';
import groupBy from 'ember-group-by';

export default Ember.Controller.extend({

  locations: groupBy('model','area'),

  lat:  function () {
  	return 32.7150;
  }.property(),

  lng:  function () {
  	return -117.1625;
  }.property(),

  zoom:     9,
  type:     'road',
  mapTypes: MAP_TYPES,

  markers: function () {
  	var locations = this.get('model.content');
  	var markers = Ember.A();
  	for (var i = 0; i<locations.length; i++) {
  		var location = locations[i]._data;
  		var marker = {};
  		marker.name = location.name;
  		marker.mapsUrl = location.mapsUrl;
  		marker.intelUrl = location.intelUrl;
   		marker.area = location.area;
   		marker.infoWindowTemplateName = 'marker-info-window';
   		debugger
  		marker.lat = location.lat?location.lat:0;
  		marker.lng = location.lng?location.lng:0;
  		marker.isDraggable = true;
  		marker.hasInfoWindow = true;
  		marker.infoWindowTemplate = 'marker-info-window';
  		markers.pushObject(marker);
  	}
  	return markers;
  }.property('model.content.@each'),


	currentLocation: null,
	newLocation: null,
	newName: null,
	area: null,

	clearEdit: function () {
		if (this.get('currentLocation')) {
			this.set('currentLocation.isEditing', false);
		}
		this.set('newLocation', null);
	},


	saveFile: function (file) {
		var _this = this;
		return new Ember.RSVP.Promise(function(resolve, reject) {;
			var fileObj = _this.store.createRecord('locations-file', {
			    file:  file,
			    fileName: file.name,
			    title: 'something'
			  });
			fileObj.save().then(
				function(fileObj) {
					console.info(fileObj.get('fileUrl'));
					_this.set('isUploading', true);
					resolve();
				}, 
				function(error){
					reject('Unable to save image.');
				}, 'file upload');
		});
	},

	validateFile: function (file) {
		return new Ember.RSVP.Promise(function(resolve, reject) {
			var reader = new FileReader();

			reader.onloadend = function(fileData) {
				//Add any client side CSV validations here
				resolve();
			}
			reader.onerror = function() {
        		reject(reader.error);
      		};
      		if (file.type === "text/csv")  {
      			reader.readAsDataURL(file);
      		}
      		else {
      		 	reject ("Please select a CSV file")
      		}
		})
	},

	actions: {
		uploadProgress: function (progress) {
			this.set('progress', progress);
		},

		triggerFileSelection: function () {
			var _this = this;
			Ember.$('#locations-upload:not(.bound)').addClass('bound').on('change', function() {
      			_this.send('receiveFile', this.files[0]);
    		});
			Ember.$('#locations-upload').trigger('click');
		},

		receiveFile: function (file) {
			if (!file) {
				this.set('isUploading', false)
			}
			else {

				var _this = this;
				this.validateFile(file).then(
					function () {
						_this.saveFile(file).then(
							function () {
								Ember.get(_this, 'flashMessages').success('Portal upload complete');
								_this.set('isUploading', false)
								_this.send('reload');
							},
							function (err) {
								_this.set('isUploading', false)
								Ember.get(_this, 'flashMessages').alert(err);
							});
					},
					function (err) {
						_this.set('isUploading', false)
						Ember.get(_this, 'flashMessages').alert(err);
					}
				);
			}
		},


		showMap: function () {
			this.set('area', null);
		},

		savePortal: function (location) {
			var flashQueue = Ember.get(this, 'flashMessages')
			var _this = this;
			location.save().then(
				function (location) {
					flashQueue.success('Location Saved');
					_this.clearEdit();
					_this.send('reload');
				},
				function () {
					flashQueue.alert('Unable to save location');
				});
		},

		addPortal: function () {
			var location = this.store.createRecord('location', {
        		name: null,
        		area: this.get('area.value'),
        		intelUrl: null,
        		mapsUrl: null,
        		shortCode: null
      		});
			this.set('newLocation', location);
		},
		deletePortal: function (location) {
			var _this = this;
			if (confirm("Are you sure you'd like to delete " + location.get('name'))) {
				location.destroyRecord().then(function () {
					_this.send('reload');
					_this.get('area.items').removeObject(location);
					_this.send('showPortals', _this.get('area'));
				});			
			}

		},
		cancelEdit: function () {
			this.clearEdit();
		},

		showPortals: function (area) {
			this.clearEdit();
			this.set("area", area);
			return false;
		},

		editPortal: function (portal) {
			this.clearEdit();
			this.set('currentLocation', portal);
			portal.set("isEditing", true);
		}
	}
});
