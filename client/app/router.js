import Ember from 'ember';
import config from './config/environment';

var Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  this.route('about', {});
  this.route('contact', {});
  this.route('login');
  this.route('signup');
  this.route('profile');
  this.route('portals');
  this.route('activate-success');
  this.route('activate-request-success');
  this.route('request-reset-password');
  this.route('reset-request-success');
  this.route('reset-success');
  this.route('password-reset');
});

export default Router;
