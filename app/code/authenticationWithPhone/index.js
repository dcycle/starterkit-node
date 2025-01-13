/**
 * Provide authentication with phone.
 */

class AuthenticationWithphone extends require('../component/index.js') {
  async init(
    app
  ) {
    super.init(app);
    // load passport.js library.
    const passport = app.c('authentication').passport();
    // The user schema defined in the base Authentication class is using
    // passport local stratergy to the userinfo schema.
    // Overriding UserInfo schema to use phoneNumber token stratergy.
    // call Authentication module for username and password login.
    // call AuthenticationWithPhone module for phone login.
    const userDetails = app.c('authentication').userDetails();
    const userDetailsSchema = userDetails.schema;
    // Ensure passport-local-mongoose is applied (it was done in the base Authentication class)
    userDetailsSchema.plugin(app.c('authentication').passportLocalMongoose());

    this.setFlagBool('initialized', true);
    passport.use(userDetails.createStrategy());
    // adds user information to session.
    passport.serializeUser(userDetails.serializeUser());
    // retrives userinformation from session.
    passport.deserializeUser(userDetails.deserializeUser());

    // Set up the custom 'phone-token' strategy to authenticate.
    // Adjust path to where PhoneTokenStratergy is present
    const PhoneTokenStratergy = require('./phoneTokenStratergy.js');
    passport.use('phoneNumber-token', new PhoneTokenStratergy({
      // Use phoneNumber for login
      phoneNumber: 'phoneNumber',
      // Use token for validation.
      token: 'token',
    }, async (phoneNumber, token, done) => {
      try {
        // Find the user by phone number.
        let user = await userDetails.findOne({ "phoneNumber": phoneNumber });
        if (!user) {
          // If user hasn't found then create new user with unique name.
          const password = app.component('./crypto/index.js').random();
          const uniqueUsername = await app.c('authentication').newUsernameLike(phoneNumber);
          // First register user with username password.
          user = await userDetails.register(
            {username: uniqueUsername, active: false},
            password
          );
          // Then add phoneNumber to the user.
          await app.c('authentication').addNonUniqueFieldToUser(
            uniqueUsername,
            "phoneNumber",
            phoneNumber
          );
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
