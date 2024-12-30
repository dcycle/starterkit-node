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
    // @ts-expect-error
    return require('crypto');
  }

  argon2() {
    // @ts-expect-error
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
   * Generates a random string of digits of a specified length.
   *
   * This method generates a string of random digits (0-9) of the
   *  given length. It can be used for generating numeric tokens,
   *  PINs, or any other random digit-based strings.
   *
   * @param {number} length - The length of the random string of
   *  digits to generate.
   * @returns {string} - A string of random digits of the specified length.
   *
   * @example
   * const randomDigitsString = app.c('crypto')randomDigits(6);
   * console.log(randomDigitsString);  // Example output: "083459"
   */
  randomDigits(length) {
    const digits = '0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += digits.charAt(Math.floor(Math.random() * digits.length));
    }
    return result;
  }

}

module.exports = new Crypto();
