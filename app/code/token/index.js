/**
 * User records.
 */

class Token extends require('../component/index.js') {

  tokenValidityInSeconds() {
    return 5 * 60;
  }

  jwt() {
    // @ts-expect-error
    return require('jsonwebtoken');
  }

  dependencies() {
    return [
      './express/index.js',
      './crypto/index.js',
      './time/index.js',
      './env/index.js',
    ];
  }

  async run(app)  {
    const that = this;

    app.c('express').addRoute('tokenRequest', 'get', '/token/request', (req, res) => {
      res.header('Content-Type', 'application/json');
      res.send(JSON.stringify({
        token: that.token(req.user._id, that.tokenValidityInSeconds(), {
          session: req.sessionID,
          loggedIn: true,
        }),
      }));
    });

    app.c('express').addRoute('tokenCheck', 'get', '/token/check-valid', (req, res) => {
      that.tokenStringToObject(req.query.token, (typeof req.user === 'undefined') ? undefined : req.user._id, req.sessionID)
        .toObjectAboutValidity()
        .then((o) => {
          res.header('Content-Type', 'application/json');
          res.send(JSON.stringify(o));
        });
    });

    return this;
  }

  /**
   * Given a user struct, expiry date and options, return a hash.
   *
   * @param userId
   *   A user like {_id: 123, ...}.
   * @param validityInSeconds
   *   How many milliseconds this token should be valid for.
   * @param options
   *   Arbitrary options as an object.
   *
   * @return
   *   A hash.
   */
  token(userId, validityInSeconds, options = {}) {
    if (validityInSeconds < 0) {
      throw 'validityInSeconds cannot be negative';
    }

    const salt = this.app().c('env').required('SALT');

    return this.app().c('token').jwt().sign({
      userId: userId,
      options: options,
    }, salt, { expiresIn: validityInSeconds + 's' });
  }

  tokenStringToObject(token, user = undefined, session = undefined) {
    const salt = this.app().c('env').required('SALT');

    try {
      const result = this.jwt().verify(token, salt);

      return new (this.app().class('token/jwtValid'))(result, user, session, this.app());
    }
    catch (e) {
      return new (this.app().class('token/jwtVerifyThrowsError'))(e);
    }
  }

}

module.exports = new Token();
