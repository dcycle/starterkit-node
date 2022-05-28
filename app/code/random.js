// @flow
/**
 * Generate random strings.
 */

class Singleton {
  random(size = 32) {
    return require('crypto')
      .randomBytes(size)
      .toString('base64')
      .slice(0, size);
  }

}

// $FlowExpectedError
module.exports = new Singleton();
