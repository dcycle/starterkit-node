// @flow
/**
 * Provide authentication.
 */

class Authentication extends require('../component/index.js') {
  async init(
    app /*:: : Object */
  ) /*:: : Object */ {
    super.init(app);

    const Schema = app.component('./database/index.js').mongoose().Schema;
    const UserDetail = new Schema({
      username: String,
      password: String
    });
    UserDetail.plugin(this.passportLocalMongoose());
    // $FlowExpectedError
    this.myUserDetails = app.c('database').mongoose().model('userInfo', UserDetail, 'userInfo');

    this.setFlagBool('initialized', true);
    this.passport().use(this.userDetails().createStrategy());
    this.passport().serializeUser(this.userDetails().serializeUser());
    this.passport().deserializeUser(this.userDetails().deserializeUser());

    return this;
  }

  dependencies() {
    return [
      './database/index.js',
      './crypto/index.js',
    ];
  }

  /**
   * Check whether a user is logged in.
   */
  loggedIn(req, res, next) {
    // req.user and req.isAuthenticated contain authentication info.
    if (req.user) {
      next();
    } else {
      res.redirect('/login');
    }
  }

  /** Mockable wrapper around require('passport-local-mongoose'). */
  passportLocalMongoose() /*:: : Object */ {
    // $FlowExpectedError
    return require('passport-local-mongoose');
  }

  passport() {
    // $FlowFixMe
    return require('passport');
  }

  /** Get UserDetails model. */
  userDetails() /*:: : Object */ {
    this.assertFlag('initialized', true);

    // $FlowExpectedError
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

  collection() {
    return this.app().c('database').client()
      .db('login')
      .collection('userInfo');
  }

  fieldNameValToObj(
    fieldName,
    fieldValue
  ) {
    let obj = {};
    obj[fieldName] = fieldValue;
    return obj;
  }

  async uniqueFieldToUsername(
    fieldName,
    fieldValue,
    desiredUsername
  ) {
    this.validateUsername(desiredUsername);
    const existing = await this.asyncUserWithUniqueFieldValueIfExists(fieldName, fieldValue);

    if (existing) {
      return existing;
    }

    const username = await this.newUsernameLike(desiredUsername);

    const user = await this
      .createOrAlterUser(username, this.app().c('crypto').random());

    await this.addUniqueFieldToUser(username, fieldName, fieldValue);

    return username;
  }

  async newUsernameLike(desiredUsername) {
    let candidate = desiredUsername;
    let count = 1;

    do {
      if (!await this.userExists(candidate)) {
        await this.registerUser(candidate, this.app().c('crypto').random());
        return candidate;
      }
    } while (candidate = desiredUsername + (count++));
  }

  async asyncUserWithUniqueFieldValueIfExists(
    fieldName,
    fieldValue
  ) {
    const searchObj = this.fieldNameValToObj(fieldName, fieldValue);

    const users = await this.collection().find(searchObj).toArray();

    if (users.length) {
      return result[0].username;
    }
    return '';
  }

  ifUserWithUniqueFieldExists(
    fieldName,
    fieldValue,
    ifExists,
    ifDoesNotExist
  ) {
    this.validateUniqueFieldName(fieldName);
    this.validateUniqueFieldValue(fieldValue);

    const searchObj = this.fieldNameValToObj(fieldName, fieldValue);

    this.collection().find(searchObj).toArray()
      .then((result) => {
        if (result.length) {
          ifExists(result[0].username);
        }
        else {
          ifDoesNotExist();
        }
      });
  }

  async addNonUniqueFieldToUser(
    username,
    fieldName,
    fieldValue
  ) {
    await this.collection().updateOne({
      username: username,
    }, {
      $set: this.fieldNameValToObj(fieldName, fieldValue),
    });
  }

  async removeFieldFromUser(
    username,
    fieldName,
  ) {
    await this.collection().updateOne({
      username: username,
    }, {
      $unset: this.fieldNameValToObj(fieldName, ""),
    });
  }

  async addUniqueFieldToUser(
    username,
    fieldName,
    fieldValue
  ) {
    this.validateUsername(username);
    this.validateUniqueFieldName(fieldName);
    this.validateUniqueFieldValue(fieldValue);

    const that = this;

    this.ifUserWithUniqueFieldExists(fieldName, fieldValue, (existing) => {
      if (username != existing) {
        throw Error('Cannot add unique field ' + fieldName + ' to user ' + username + ' with value ' + fieldValue + ' because a different user, ' + existing + ', already has that value in the same field.');
      }
    }, async () => {
      await that.addNonUniqueFieldToUser(username, fieldName, fieldValue);
    });
  }

  /** Register a user, throw an error if there is an issue. */
  async registerUser(
    username /*:: : string */,
    password /*:: : string */
  ) {

    this.validateUsername(username);
    this.validatePassword(password);
    await this.userDetails().register({username: username, active: false}, password);
  }

  /** Validate a username, throw an error if it does not validate. */
  validateUsername(
    username /*:: : string */
  ) {
    if (typeof username === 'undefined') {
      throw Error('Username cannot be undefined.');
    }
    this.valiedateGenericNonEmpty(username, 'Usernames');
  }

  /** Validate a password, throw an error if it does not validate. */
  validatePassword(
    password /*:: : string */
  ) {
    this.valiedateGenericNonEmpty(password, 'Passowords');
  }

  valiedateGenericNonEmpty(
    value,
    message
  ) {
    if (!value.length) {
      throw Error(value + ' cannot be empty.');
    }
  }

  validateUniqueFieldName(
    fieldName /*:: : string */
  ) {
    this.valiedateGenericNonEmpty(fieldName, 'Field names');
  }

  validateUniqueFieldValue(
    uniqueFieldValue /*:: : string */
  ) {
    this.valiedateGenericNonEmpty(uniqueFieldValue, 'Unique field values');
  }

  async allUsers() {
    return await this.userDetails().find();
  }

  async userExists(name) {
    return (await this.userDetails().find({username: name})).length;
  }

  async userIdExists(id) {
    // $FlowFixMe
    const ObjectId  = require('mongodb').ObjectID;

    return (await this.userDetails().find({_id: ObjectId(id)})).length;
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

// $FlowExpectedError
module.exports = new Authentication();
