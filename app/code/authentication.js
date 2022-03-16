// @flow
/**
 *
 * You can test this by running:
 * ./scripts/node-cli.sh
 * const myDatabase = require('./app/myDatabase.js').init();
 * const myAuthentication = require('./app/myAuthentication.js').init(myDatabase);
 */

'use strict';

module.exports = {

  /** Initialize the authentication system. */
  init: function(
    database /*:: : Object */ ) /*:: : Object */ {

    const Schema = database.mongoose().Schema;
    const UserDetail = new Schema({
      username: String,
      password: String
    });
    UserDetail.plugin(this.passportLocalMongoose());
    this.myUserDetails = database.mongoose().model('userInfo', UserDetail, 'userInfo');
    return this;
  },

  /** Mockable wrapper around require('passport-local-mongoose'). */
  passportLocalMongoose: function() /*:: : Object */ {
    // $FlowExpectedError
    return require('passport-local-mongoose');
  },

  /** Get UserDetails model. */
  userDetails: function() /*:: : Object */ {
    return this.myUserDetails;
  },

  /** Register a user, throw an error if there is an issue. */
  registerUser: function(
    username /*:: : string */ ,
    password /*:: : string */ ) {

    this.validateUsername(username);
    this.validatePassword(password);
    this.userDetails().register({username: username, active: false}, password);
  },

  /** Validate a username, throw an error if it does not validate. */
  validateUsername: function(
    username /*:: : string */ ) {

    if (!username.length) {
      throw Error('Usernames cannot be empty.');
    }
  },

  /** Validate a password, throw an error if it does not validate. */
  validatePassword: function(
    password  /*:: : string */ ) {

    if (!password.length) {
      throw Error('Passwords cannot be empty.');
    }
  },

  allUsers: async function() {
    return await this.userDetails().find();
  },

  userExists: async function(name) {
    return (await this.userDetails().find({username: name})).length;
  },

  user: async function(name) {
    if (await this.userExists(name)) {
      return (await this.userDetails().find({username: name}))[0];
    }
    throw Error('User does not exist');
  },

  changePassword: async function(name, pass) {
    if (await this.userExists(name)) {
      const user = await this.user(name);
      await user.setPassword(pass);
      await user.save();
    }
    else {
      throw Error('User does not exist');
    }
  },

};
