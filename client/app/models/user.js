import DS from "ember-data";

export default DS.Model.extend({
  name: DS.attr(),
  email: DS.attr(),
  password: DS.attr(),
  isAdmin: DS.attr(),
  avatar: DS.attr(),
  slackName: DS.attr()
});
