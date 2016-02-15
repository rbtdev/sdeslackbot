import Ember from 'ember';
import {MAP_TYPES} from '../components/google-map';
import groupBy from 'ember-group-by';

export default Ember.Controller.extend({

  locations: groupBy('model','area'),

  lat:  function () {
  	return this.get('markers')[0].lat;
  }.property('markers'),

  lng:  function () {
  	 return this.get('markers')[0].lng;
  }.property('markers'),

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

  		var urlArr = location.intelUrl.split("=");
  		var llStr = urlArr[urlArr.length-1];
  		var ll = llStr.split(',');

  		marker.lat = parseFloat(ll[0]);
  		marker.lng = parseFloat(ll[1]);
  		marker.isDraggable = true;
  		marker.hasInfoWindow = true;
  		marker.infoWindowTemplate = 'marker-info-window';
  		markers.pushObject(marker);
  	}
  	return markers;
  }.property('model'),


	currentLocation: null,
	newLocation: null,
	newName: null,
	showMap: false,
	area: null,

	mapButtonLabel: function () {
		return this.get('showMap')?"Hide Map":"Show Map";
	}.property('showMap'),

	clearEdit: function () {
		if (this.get('currentLocation')) {
			this.set('currentLocation.isEditing', false);
		}
		this.set('newLocation', null);
	},

	actions: {
		toggleMap: function () {
			this.toggleProperty('showMap');
		},

		toggle: function(location) {
			if (this.get('currentLocation')) {
				if (this.get('currentLocation.id') === location.get('id')) {
					location.set('active', false);
					this.set('currentLocation', null)
				}
				else {
					this.set('currentLocation.active', false);
					location.set('active', true);
					this.set('currentLocation', location)
				}
			}
			else {
				this.set('currentLocation', location);
				location.set('active', true);
			}
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
		cancel: function () {
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
