// @flow
/**
 * Get environment variables.
 */

class Singleton {
  required(
    name /*:: : string */
  ) {
    const candidate = process.env[name];
    if (typeof candidate === 'undefined') {
      throw Error('Environemnt variable ' + name + ' is required.');
    }
    return String(candidate);
  }
}

// $FlowExpectedError
module.exports = new Singleton();
