/**
 * Get environment variables.
 */

class Env {
  required(
    name /*:: : string */
  ) {
    // @ts-expect-error
    const candidate = process.env[name];
    if (typeof candidate === 'undefined') {
      throw Error('Environemnt variable ' + name + ' is required.');
    }
    return String(candidate);
  }

  getOrFallback(
    name /*:: : string */,
    fallback /*:: : string */
  ) {
    // @ts-expect-error
    const candidate = process.env[name];
    if (typeof candidate === 'undefined' || candidate === '') {
      return fallback;
    }
    return String(candidate);
  }
}

module.exports = new Env();
