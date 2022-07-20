// @flow
/**
 * Generate random strings.
 */

class Random {

  /**
   * Generate a string of "size" bypes which can look something like
   * lJSyYJKpb0aNdfaqbcjIprmg9nKi69Em.
   */
  random(
    size /*:: : number */ = 32
  ) /*:: : string */ {
    if (size <= 0) {
      return '';
    }
    return require('crypto')
      .randomBytes(size)
      .toString('base64')
      .slice(0, size);
  }

}

// $FlowExpectedError
module.exports = new Random();
