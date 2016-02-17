import Ember from 'ember';

export default Ember.Controller.extend({
  queryParams: ['pwResetKey'],
  pwResetKey: null,

  	password: "",
	verifypw: "",

	hasPassword: Ember.computed.notEmpty('password'),
	pwIsStrong: Ember.computed.match('password', /^(?=.*\d).{4,12}$/),

	pwIsEqual: function () {
		return (this.get('password') === this.get('verifypw'))
	}.property('password', 'verifypw'),

	passwordIsValid: function () {
		return (this.get('hasPassword') && this.get('pwIsEqual') && this.get('pwIsStrong'));
	}.property('hasPassword', 'pwIsEqual'),

	isReady: function () {
		return this.get('passwordIsValid');
	}.property('passwordIsValid'),

	actions: {
		resetPw: function () {
			var _this = this;
			var flashQueue = Ember.get(this, 'flashMessages');
			var pwReset = this.store.createRecord('password-reset', {
				pwResetKey: this.get('pwResetKey'),
				newPw: this.get('password')
			});

			pwReset.save().then(function () {
				_this.transitionToRoute('reset-success');
			},
			function () {
				flashQueue.alert('Password reset failed.');
			})
		}
	}
});