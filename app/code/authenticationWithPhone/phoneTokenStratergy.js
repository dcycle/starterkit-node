/**
 * PhoneTokenStratergy is a Custom passport stratergy defined here
 * to implement phone number and token authentication.
 *
 * Local stratergy uses username and password for authentication.
 * github uses passport github stratergy for authentication.
 * gmail uses passport google stratergy for authentication.
 *
 * For phone number authentication we have to define custom stratergy.
 *
 * You can refer authenticationWithPhone/index.js for calling phoneNumber-token Stratergy.
 *
 *   // Set up the custom 'phone-token' strategy to authenticate.
 *   const PhoneTokenStratergy = require('./phoneTokenStratergy.js');
 *   passport.use('phoneNumber-token', new PhoneTokenStratergy({
 *     // Use phoneNumber for login
 *     phoneNumber: 'phoneNumber',
 *     // Use token for validation.
 *     token: 'token',
 *   }, async (phoneNumber, token, done) => {});
 *
 */
// @ts-expect-error
const passport = require('passport');
// @ts-expect-error
const Strategy = require('passport-strategy');

class PhoneTokenStratergy extends Strategy {
  constructor(options, verify) {
    super();
    // This is how Passport will identify this strategy
    this.name = 'phone-token';
    // Optional: default is 'username'
    this.phoneNumber = options.phoneNumber;
    this.token = options.token;
    this.verify = verify;
  }

  authenticate(req, options) {
    // Get the phone number and OTP from the request
    const phoneNumber = req.body[this.phoneNumber];
    const token = req.body[this.token];

    if (!phoneNumber || !token) {
      // @ts-expect-error
      return this.fail({ message: 'Phone number and Token are required' });
    }

    // Now, call the verify function that you passed into the constructor
    this.verify(phoneNumber, token, (err, user, info) => {
      if (err) {
        // @ts-expect-error
        return this.error(err);
      }
      if (!user) {
        // @ts-expect-error
        return this.fail(info || { message: 'User not found.' });
      }

      // If everything is good, authenticate the user
      // @ts-expect-error
      return this.success(user, info);
    });
  }
}

// Make sure you're exporting the class correctly
module.exports = PhoneTokenStratergy;
