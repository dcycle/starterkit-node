// @flow
/**
 * An abstract token.
 */

class Token {

  toObjectAboutValidity() {
    throw 'Please override';
  }

}

// $FlowExpectedError
module.exports = Token;
