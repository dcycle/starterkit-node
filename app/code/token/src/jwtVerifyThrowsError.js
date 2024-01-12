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

  async toObjectAboutValidity() /*:: : Object */ {
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
