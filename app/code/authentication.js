// @flow
/**
 *
 * You can test this by running:
 */

'use strict';

class Singleton {
  async init(database) {
    const Schema = database.mongoose().Schema;
    const UserDetail = new Schema({
      username: String,
      password: String
    });
    UserDetail.plugin(this.passportLocalMongoose());
    this.myUserDetails = database.mongoose().model('userInfo', UserDetail, 'userInfo');
    return this;
  }

  /** Mockable wrapper around require('passport-local-mongoose'). */
  passportLocalMongoose() /*:: : Object */ {
    // $FlowExpectedError
    return require('passport-local-mongoose');
  }

  passport() {
    return require('passport');
  }

  connectEnsureLogin() {
    return require('connect-ensure-login');
  }

  /** Get UserDetails model. */
  userDetails() /*:: : Object */ {
    return this.myUserDetails;
  }

  /** Register or alter a user. */
  async createOrAlterUser(
    username /*:: : string */,
    password /*:: : string */
  ) {
    this.validateUsername(username);
    this.validatePassword(password);
    if (await this.userExists(username)) {
      await this.changePassword(username, password);
    }
    else {
      await this.registerUser(username, password);
    }
  }

  /** Register a user, throw an error if there is an issue. */
  registerUser(
    username /*:: : string */,
    password /*:: : string */
  ) {

    this.validateUsername(username);
    this.validatePassword(password);
    this.userDetails().register({username: username, active: false}, password);
  }

  /** Validate a username, throw an error if it does not validate. */
  validateUsername(
    username /*:: : string */
  ) {

    if (!username.length) {
      throw Error('Usernames cannot be empty.');
    }
  }

  /** Validate a password, throw an error if it does not validate. */
  validatePassword(
    password  /*:: : string */
  ) {

    if (!password.length) {
      throw Error('Passwords cannot be empty.');
    }
  }

  async allUsers() {
    return await this.userDetails().find();
  }

  async userExists(name) {
    return (await this.userDetails().find({username: name})).length;
  }

  async user(name) {
    if (await this.userExists(name)) {
      return (await this.userDetails().find({username: name}))[0];
    }
    throw Error('User does not exist');
  }

  async changePassword(name, pass) {
    if (await this.userExists(name)) {
      const user = await this.user(name);
      await user.setPassword(pass);
      await user.save();
    }
    else {
      throw Error('User does not exist');
    }
  }
}

module.exports = new Singleton;
