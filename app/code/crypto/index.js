// @flow
/**
 * Generate random strings, and other crypto operations.
 */

class Crypto {

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
    return this.crypto()
      .randomBytes(size)
      .toString('base64')
      .slice(0, size);
  }

  crypto() {
    return require('crypto');
  }

  argon2() {
    return require('argon2');
  }

  /**
   * Hash a string. Use verify() to check it.
   *
   * See "Secure Password Hashing in Node with Argon2", by Randall Degges,
   * February 2, 2016, Storm Path.
   * https://stormpath.com/blog/secure-password-hashing-in-node-with-argon2.
   * See "Hashing Passwords with Argon2", Inquiryum.
   * https://inquiryum.com/modules/nodejs%20module/Hashing-Passwords-&-Argon2/.
   *
   * Argon2 seems to be a secure hasing algorithm as of this writing.
   */
  async hash(string) {
    if (!string) {
      throw 'Cannot hash empty string';
    }
    return await this.argon2().hash(string);
  }

  /**
   * Check a hash generated with hash().
   */
  async checkHash(hash, string) {
    return await this.argon2().verify(hash, string);
  }

  /**
   * Two-way encrypt.
   */
  async checkHash(hash, string) {
    return await this.argon2().verify(hash, string);
  }

}

// $FlowExpectedError
module.exports = new Crypto();
