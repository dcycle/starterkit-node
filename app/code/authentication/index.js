/**
 * Provide authentication.
 */

class Authentication extends require('../component/index.js') {
  async init(
    app
  ) {
    super.init(app);

    const Schema = app.component('./database/index.js').mongoose().Schema;
    const UserDetail = new Schema({
      username: String,
      password: String,
    }, {
      // This will add createdAt and updatedAt fields.
      timestamps: true
    });

    UserDetail.plugin(this.passportLocalMongoose());
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

  passportLocalMongoose() {
    // @ts-expect-error
    return require('passport-local-mongoose');
  }

  passport() {
    // @ts-expect-error
    return require('passport');
  }

  /** Get UserDetails model. */
  userDetails() /*:: : Object */ {
    this.assertFlag('initialized', true);

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

  userFieldValue(
    userObj,
    fieldName,
    defaultValue
  ) {
    // I'm not sure why this is necessary, but it is.
    const userStringifiedThenParsed = JSON.parse(JSON.stringify(userObj));
    if (userStringifiedThenParsed[fieldName]) {
      return userStringifiedThenParsed[fieldName];
    }
    return defaultValue;
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

  async newUsernameLike(
    desiredUsername
  ) {
    let candidate = desiredUsername;
    let count = 1;

    do {
      if (!await this.userExists(candidate)) {
        return candidate;
      }
      candidate = desiredUsername + (count++);
    } while (true);

    return '';
  }

  async asyncUserWithUniqueFieldValueIfExists(
    fieldName,
    fieldValue
  ) {
    const searchObj = this.fieldNameValToObj(fieldName, fieldValue);

    const users = await this.collection().find(searchObj).toArray();

    if (users.length) {
      return users[0].username;
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
    username
  ) {
    if (typeof username === 'undefined') {
      throw Error('Username cannot be undefined.');
    }
    this.validateGenericNonEmpty(username, 'Usernames');
  }

  /** Validate a password, throw an error if it does not validate. */
  validatePassword(
    password /*:: : string */
  ) {
    this.validateGenericNonEmpty(password, 'Passowords');
  }

  validateGenericNonEmpty(
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
    this.validateGenericNonEmpty(fieldName, 'Field names');
  }

  validateUniqueFieldValue(
    uniqueFieldValue /*:: : string */
  ) {
    this.validateGenericNonEmpty(uniqueFieldValue, 'Unique field values');
  }

  async allUsers() {
    return await this.userDetails().find();
  }

  async userExists(name) {
    return (await this.userDetails().find({username: name})).length;
  }

  async userIdExists(id) {
    // @ts-expect-error
    const ObjectId  = require('mongodb').ObjectID;

    return (await this.userDetails().find({_id: ObjectId(id)})).length;
  }

  async getUserInfoById(id) {
    return await this.userDetails().find(id);
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

module.exports = new Authentication();
