// @flow
/**
 * User records.
 */

class Token extends require('../component/index.js') {

  tokenValidityInMilliseconds() {
    return 5 * 60 * 1000;
  }

  dependencies() {
    return [
      './express/index.js',
      './crypto/index.js',
      './time/index.js',
      './env/index.js',
    ];
  }

  async run(
    app /*:: : Object */
  ) /*:: : Object */ {

    const that = this;

    app.c('express').addRoute('tokenRequest', 'get', '/token/request', (req, res) => {
      that.token(req.user, that.tokenValidityInMilliseconds(), {
        session: req.sessionID,
        sameOrigin: true,
        loggedIn: true,
      }).then((token) => {
        res.send(JSON.stringify({
          token: token,
        }));
      });
    });
  }

  /**
   * Given a user struct, expiry date and options, return a hash.
   *
   * @param userId
   *   A user like {_id: 123, ...}.
   * @param validityInMilliseconds
   *   How many milliseconds this token should be valid for.
   * @param options
   *   Arbitrary options.
   *
   * @return
   *   A hash.
   */
  async token(userId, validityInMilliseconds, options) {
    if (validityInMilliseconds < 0) {
      throw 'validityInMilliseconds cannot be negative';
    }

    const expiry = Date.parse(this.app()
      .c('time')
      .nowPlusMilliseconds(validityInMilliseconds));

    const user = await this.userIdToUser(userId);

    // user has an ID and, potentially tokens.
    const crypto = this.app().c('crypto');
    let tokens = (typeof user.tokens === 'object') ? user.tokens : [];
    const random = crypto.random();
    const that = this;

    tokens.push({
      token: random,
      expiry: this.app().c('time').nowPlusMilliseconds(validityInMilliseconds),
      options: options,
    });

    setTimeout(() => {
      that.cleanUpTokens(userId);
    }, validityInMilliseconds);

    const ObjectId  = require('mongodb').ObjectID;
    await this.app()
      .c('database')
      .client()
      .db('login')
      .collection('userInfo').updateOne({_id: ObjectId(userId)}, {$set:{tokens: tokens}});

    return crypto.hash(random);
  }

  async userIdToUser(userId) {
    const ObjectId  = require('mongodb').ObjectID;
    const user = await this.app().c('database').client().db('login').collection('userInfo').findOne({_id: ObjectId(userId)});
    if (user === null) {
      throw 'User does not exist';
    }
    return user;
  }

  async cleanUpTokens(userId) {
    const user = await this.userIdToUser(userId);

    const ObjectId  = require('mongodb').ObjectID;

    let newTokenList = [];

    const that = this;

    user.tokens.forEach((t) => {
      if (that.tokenValid(t)) {
        newTokenList.push(t);
      }
    });

    await this.app()
      .c('database')
      .client()
      .db('login')
      .collection('userInfo').updateOne({_id: ObjectId(userId)}, {$set:{tokens: newTokenList}});
  }

  tokenValid(token) {
    if (typeof token.expiry === 'undefined') {
      return false;
    }
    return token.expiry >= Date.now();
  }

}

// $FlowExpectedError
module.exports = new Token();
