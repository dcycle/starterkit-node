// @flow
/**
 * Provide user/pass authentication.
 */

class UserPassAuth extends require('../component/index.js') {

  dependencies() {
    return [
      './webAuth/index.js',
    ];
  }

}

// $FlowExpectedError
module.exports = new UserPassAuth();
