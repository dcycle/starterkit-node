// @flow
/**
 * An token which cannot be interpreted by JWT.
 */

class JwtValid extends require('./token.js') {

  constructor(
    token,
    userId,
    session,
    app
  ) {
    super();
    this._token = token;
    this._userId = userId;
    this._session = session;
    this._app = app;
  }

  async toObjectAboutValidity() {
    let info = [];
    // Tokens are always associated with users.
    const tokenUserId = this._token.userId;
    let valid = true;

    if (await (this._app.c('authentication')).userIdExists(tokenUserId)) {
      info.push('The user ID associated with this token exists in the database.')
      if (typeof this._token.options.session !== 'undefined') {
        info.push('The token is limited to a given session.')
        if (this._token.options.session !== this._session) {
          valid = false;
          info.push('The token is locked down to a given session which is not the current session.');
        }
        else {
          info.push('The token is locked down to a given session, and it has been verified to be the current session.');
        }
      }
      else {
        info.push('The token is not limited to a given session.');
      }
    }
    else {
      valid = false;
      info.push('The user ID associated with this token does not exist in the database.');
    }

    if (valid) {
      if (this._token.options.loggedIn === true) {
        info.push('The token can be used only if the user is logged in.');
        if (this._token.userId == this._userId) {
          info.push('The user is logged in.');
        }
        else {
          info.push('The user is not logged in.');
          info.push(this._token.userId);
          info.push(this._userId);
          valid = false;
        }
      }
      else {
        info.push('The token can be used even if the user is not logged in.');
      }
    }

    let ret = {
      valid: valid,
      info: info,
    };

    if (valid) {
      ret.seconds_left = Math.max(0, (this._token.exp - (Date.now()/1000)));
    }

    return ret;
  }

}

// $FlowExpectedError
module.exports = JwtValid;
