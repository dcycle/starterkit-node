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

  callbackPath() {
    return this.app().config().modules['./loginWithGoogle/index.js'].callback;
  }

  callbackURL() {
    return this.app().config().modules['./loginWithGoogle/index.js'].baseUrl + this.callbackPath();
  }

  async profileToEmail(
    profile
  ) {
    const googleEmail = this.profileToGoogleEmail(profile);

    return await this.app().c('authentication').
      uniqueFieldToUsername(
        'google_email',
        googleEmail,
        googleEmail
      );
  }

  profileToGoogleEmail(
    profile
  ) {
    // Check if profile.emails exists and has at least one email
    if (!profile.emails || !Array.isArray(profile.emails) || profile.emails.length === 0) {
      throw new Error('Cannot extract email from profile: No emails found.');
    }

    const email = profile.emails['0'].value;

    if (typeof email === 'undefined') {
      throw 'Cannot extract email from profile.';
    }

    if (!email) {
      throw 'Email cannot be empty.';
    }

    return email;
  }

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
          const username = await that.profileToEmail(profile);
          app.c('authentication')
            .user(username)
            .then((user) => {
              done(null, user);
            });
          done(null, user);
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

    app.c('express').addRoute('googleErr', 'get', '/auth/google-error', (req, res) => {
      const errorMessage = 'You have cancelled the login with Google.';
      // Redirect to /login with the message
      res.redirect(`/login?error=${encodeURIComponent(errorMessage)}`);      
    });

    // GET /auth/google
    //   Use passport.authenticate() as route middleware to authenticate the
    //   request.  The first step in Google authentication will involve
    //   redirecting the user to https://accounts.google.com/.  After authorization, 
    //   Google will redirect the user back to this application at /auth/google/callback.

    app.c('express').addMiddleware('google_auth', 'get', [
      passport.authenticate('google', { scope: ['email'] })
    ]);

    app.c('express').addRoute('google_auth', 'get', '/auth/google', (req, res) => {
      // The request will be redirected to GitHub for authentication, so this
      // function will not be called.
    });

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

    app.c('express').addRoute('google_auth_callback', 'get', this.callbackPath(), (req, res) => {
      // We'll register the route here, but the middlewares, defined in run(),
      // actually calls the github callback.
      return res.redirect('/');
    });

    return this;
  }
}

module.exports = new LoginWithGoogle();
