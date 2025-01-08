/**
 * Provide authentication with phone.
 */

class AuthenticationWithphone extends require('../component/index.js') {
  async init(
    app
  ) {
    super.init(app);
    const passport = app.c('authentication').passport();
    // We are now using the schema defined in the base Authentication class
    const userDetails = app.c('authentication').userDetails();
    const userDetailsSchema = userDetails.schema;
    // Ensure passport-local-mongoose is applied (it was done in the base Authentication class)
    userDetailsSchema.plugin(app.c('authentication').passportLocalMongoose());

    // Set up passport strategies and user serialization as done in the base Authentication class
    this.setFlagBool('initialized', true);
    passport.use(userDetails.createStrategy());
    passport.serializeUser(userDetails.serializeUser());
    passport.deserializeUser(userDetails.deserializeUser());

    // Now, set up the custom 'phone-token' strategy to authenticate
    // Adjust path to where PhoneTokenStratergy is
    // @ts-expect-error
    const PhoneTokenStratergy = require('./phoneTokenStratergy.js');
    passport.use('phoneNumber-token', new PhoneTokenStratergy({
      phoneNumber: 'phoneNumber',  // Use phoneNumber for login
      token: 'token',          // Use token as the password field
    }, async (phoneNumber, token, done) => {
      try {
        // Find the user by phone number
        const user = await userDetails.findOne({ phoneNumber: phoneNumber });
        if (!user) {
          return done(null, false, { message: 'Phone number not found' });
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }));

    return this;
  }

  dependencies() {
    return [
      './database/index.js'
    ];
  }
}

module.exports = new AuthenticationWithphone();
