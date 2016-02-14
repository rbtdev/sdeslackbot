import Ember from 'ember';
import config from './config/environment';

var Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function () {
  this.route('about', {});
  this.route('contact', {});
  this.route('login');
  this.route('signup');
  this.route('profile');
});

export default Router;