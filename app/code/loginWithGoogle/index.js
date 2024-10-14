/**
 * Allow users to log in with Google.
 */

class LoginWithGoogle extends require('../component/index.js') {

  dependencies() {
    return [
      './express/index.js',
      './authentication/index.js',
      './database/index.js'
    ];
  }

  /**
   * Retrieves the callback path for Google authentication.
   * @returns {string} The callback path.
   */
  callbackPath() {
    return this.app().config().modules['./loginWithGoogle/index.js'].callback;
  }

  /**
   * Constructs the full callback URL for Google authentication.
   * @returns {string} The full callback URL.
   */
  callbackURL() {
    return this.app().config().modules['./loginWithGoogle/index.js'].baseUrl + this.callbackPath();
  }

  /**
   * Stores and Retrieves displayName extracted from google profile into and
   * from mongoose userInfo collection.
   * @param {Object} profile - The Google user profile.
   * @returns {Promise<string>} The username associated with the Google displayName.
   * @throws Will throw an error if the displayName cannot be extracted.
   */
  async profileToDisplayName(
    profile
  ) {
    const googleDisplayName = this.profileToGoogleDisplayName(profile);
    const googleEmail = this.profileToGoogleEmail(profile);

    return await this.app().c('authentication').
      uniqueFieldToUsername(
        'google_email',
        googleEmail,
        googleDisplayName
      );
  }

  /**
   * Extracts the displayName address from the Google profile.
   * @param {Object} profile - The Google user profile.
   * @returns {string} The extracted displayName.
   * @throws Will throw an error if no displayName is found or if the displayName is invalid.
   */
   profileToGoogleDisplayName(profile) {
    // Check if profile.displayName exists.
    if (!profile.displayName) {
      throw new Error('Cannot extract displayName from profile: No displayName found.');
    }
    // Use bracket notation for better readability
    const displayName = profile.displayName;

    if (typeof displayName === 'undefined') {
      throw new Error('Cannot extract displayName from profile.');
    }

    if (!displayName) {
      throw new Error('Display Name cannot be empty.');
    }

    return displayName;
  }

  /**
   * Extracts the email address from the Google profile.
   * @param {Object} profile - The Google user profile.
   * @returns {string} The extracted email.
   * @throws Will throw an error if no email is found or if the email is invalid.
   */
  profileToGoogleEmail(profile) {
    // Check if profile.emails exists and has at least one email
    if (!profile.emails || !Array.isArray(profile.emails) || profile.emails.length === 0) {
      throw new Error('Cannot extract email from profile: No emails found.');
    }
    // Use bracket notation for better readability
    const email = profile.emails[0].value;

    if (typeof email === 'undefined') {
      throw new Error('Cannot extract email from profile.');
    }

    if (!email) {
      throw new Error('Email cannot be empty.');
    }

    return email;
  }

  /**
   * Initializes the Google authentication strategy with Passport.js.
   * @param {Object} app - The application instance.
   * @returns {Promise<this>} The initialized component instance.
   */
  async init(app)  {
    super.init(app);

    const client = app.config().modules['./loginWithGoogle/index.js'].client;
    const secret = app.config().modules['./loginWithGoogle/index.js'].secret;

    const passport = app.c('authentication').passport();
    // @ts-expect-error
    const GoogleStrategy = require('passport-google-oauth20').Strategy;

    const that = this;
    passport.use(new GoogleStrategy({
        clientID: client,
        clientSecret: secret,
        callbackURL: that.callbackURL(),
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const username = await that.profileToDisplayName(profile);
          // Creates a user session.
          app.c('authentication')
            .user(username)
            .then((user) => {
              done(null, user);
            });
        } catch (error) {
          done(error); // Pass the error to the next middleware
        }            
      }
    ));

    // @ts-expect-error
    const expressSession = require('express-session');

    const expressApp = app.c('express').expressApp();

    expressApp.use(expressSession({
      name: 'google-auth-session',
      keys: ['key1', 'key2'],
      // Store session in mongo db.
      store: app.component('./database/index.js').mongoStore()
    }));
    expressApp.use(passport.initialize());
    expressApp.use(passport.session());
    /**
     * If user cancel the permission in accounts.google.com page
     * then redirect to apps login page.
     */
    app.c('express').addRoute('googleErr', 'get', '/auth/google-error', (req, res) => {
      const errorMessage = 'You have cancelled the login with Google.';
      // Redirect to /login with the message.
      res.redirect(`/login?error=${encodeURIComponent(errorMessage)}`);      
    });

    // GET /auth/google
    //   Use passport.authenticate() as route middleware to authenticate the
    //   request.  The first step in Google authentication will involve
    //   redirecting the user to https://accounts.google.com/.  After authorization, 
    //   Google will redirect the user back to this application at /auth/google/callback.

    app.c('express').addMiddleware('google_auth', 'get', [
      // Limit Access to only profile from google.
      passport.authenticate('google', { scope: ['profile', 'email'] })
    ]);

    app.c('express').addRoute('google_auth', 'get', '/auth/google', (req, res) => {
      // The request will be redirected to GitHub for authentication, so this
      // function will not be called.
    });

    // Middleware to handle the Google authentication callback.
    app.c('express').addMiddleware('google_auth_callback', 'get', [
      function(req, res, next) {
        const callback = passport.authenticate('google', {
          failureRedirect: '/auth/google-error',
          // Enable flash messages if using express-flash.
          failureFlash: true,
        });
        try {
          callback(req, res, next);
        }
        catch(e) {
          res.send('An error occurred: ' + e);
        }
      }
    ]);

    // Route to handle successful authentication callback
    app.c('express').addRoute('google_auth_callback', 'get', this.callbackPath(), (req, res) => {
      // We'll register the route here, but the middlewares, defined in run(),
      // actually calls the github callback.
      return res.redirect('/');
    });

    return this;
  }
}

module.exports = new LoginWithGoogle();
