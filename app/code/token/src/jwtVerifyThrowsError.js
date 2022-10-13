// @flow
/**
 * An token which cannot be interpreted by JWT.
 */

class JwtVerifyThrowsError extends require('./token.js') {

  constructor(
    error
  ) {
    super();
    this._error = error;
  }

  async toObjectAboutValidity() {
    return {
      valid: false,
      messages: {
        jwt_error: this._error.toString(),
        error: this._error.stack,
      },
    };
  }

}

// $FlowExpectedError
module.exports = JwtVerifyThrowsError;
