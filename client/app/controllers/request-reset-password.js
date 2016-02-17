import Ember from 'ember';

export default Ember.Controller.extend({

	actions: {

		resetPw: function () {
			var _this = this;
			var pwReset = this.store.createRecord('password-reset-request', {
				email: this.get('email')
			});

			pwReset.save().then (
				function () {
					_this.transitionToRoute('reset-success')
				},
				function (err) {
					_this.set('resetFailed', true)
				}
			);
		}
	}
});