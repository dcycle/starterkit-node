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

  addTwoNumbers(
    a /*:: : number */,
    b /*:: : number */
  ) /*:: : number */ {
    return a+b;
  }
}

// $FlowExpectedError
module.exports = new Singleton();
