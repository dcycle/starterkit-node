// @flow
/**
 * Generate random strings.
 */

'use strict';

class Singleton {
  random(size = 32) {
    return require('crypto')
      .randomBytes(size)
      .toString('base64')
      .slice(0, size);
  }
}

module.exports = new Singleton();
