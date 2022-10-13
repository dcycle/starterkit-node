/**
 * An token which cannot be interpreted by JWT.
 */

// $FlowFixMe
class JwtVerifyThrowsError extends require('./token.js') {

  constructor(
    // $FlowFixMe
    error
  ) {
    super();
    // $FlowFixMe
    this._error = error;
  }

  async toObjectAboutValidity() /*:: : Object */ {
    // $FlowFixMe
    const error = this._error;

    return {
      valid: false,
      messages: {
        jwt_error: error.toString(),
        error: error.stack,
      },
    };
  }

}

module.exports = JwtVerifyThrowsError;
