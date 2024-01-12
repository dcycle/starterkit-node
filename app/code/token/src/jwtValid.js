/**
 * An token which cannot be interpreted by JWT.
 */

class JwtValid extends require('./token.js') {

  constructor(
    token /*:: : string */,
    userId /*:: : string */,
    session /*:: : string */,
    app /*:: : Object */
  ) {
    super();
    this._token = token;
    this._userId = userId;
    this._session = session;
    this._app = app;
  }

  async toObjectAboutValidity() /*:: : Object */ {
    const token = this._token;

    const userId = this._userId;

    const session = this._session;

    const app = this._app;

    let info = [];
    // Tokens are always associated with users.
    const tokenUserId = token.userId;
    let valid = true;

    if (await (app.c('authentication')).userIdExists(tokenUserId)) {
      info.push('The user ID associated with this token exists in the database.');
      if (typeof token.options.session !== 'undefined') {
        info.push('The token is limited to a given session.');
        if (token.options.session !== session) {
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
      if (token.options.loggedIn === true) {
        info.push('The token can be used only if the user is logged in.');
        if (token.userId == userId) {
          info.push('The user is logged in.');
        }
        else {
          info.push('The user is not logged in.');
          info.push(token.userId);
          info.push(userId);
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
      seconds_left: undefined,
    };

    if (valid) {
      ret.seconds_left = Math.max(0, (token.exp - (Date.now()/1000)));
    }

    return ret;
  }

}

module.exports = JwtValid;
