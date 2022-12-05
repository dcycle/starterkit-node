// @flow
/**
 * Allow users to log in with GitHub.
 */

class LoginWithGitHub extends require('../component/index.js') {

  dependencies() {
    return [
      './express/index.js',
      './authentication/index.js',
    ];
  }

  callbackPath() {
    return this.app().config().modules['./loginWithGitHub/index.js'].callback;
  }

  callbackURL() {
    return this.app().config().modules['./loginWithGitHub/index.js'].baseUrl + this.callbackPath();
  }

  async profileToUsername(
    profile,
    callback
  ) {
    const gitHubUsername = this.profileToGitHubUsername(profile);

    return await this.app().c('authentication').
      uniqueFieldToUsername(
        'github_username',
        gitHubUsername,
        gitHubUsername
      );
  }

  profileToGitHubUsername(
    profile
  ) {
    const candidate = profile.username;

    if (typeof candidate === 'undefined') {
      throw 'Cannot extract username from profile.'
    }

    if (!candidate) {
      throw 'Username cannot be empty.'
    }

    return candidate;
  }

  async init(
    app /*:: : Object */
  ) /*:: : Object */ {
    super.init(app);

    const client = app.config().modules['./loginWithGitHub/index.js'].client;
    const secret = app.config().modules['./loginWithGitHub/index.js'].secret;

    const passport = app.c('authentication').passport();
    // $FlowFixMe
    const gitHubStrategy = require('passport-github2').Strategy;

    const that = this;
    passport.use(new gitHubStrategy({
      clientID: client,
      clientSecret: secret,
      callbackURL: that.callbackURL(),
    }, async (accessToken, refreshToken, profile, done) => {
      username = await that.profileToUsername(profile);
      app.c('authentication')
        .user(username)
        .then((user) => {
          done(null, user);
        });
    }));

    // $FlowFixMe
    const expressSession = require('express-session');

    const expressApp = app.c('express').expressApp();

    expressApp.use(expressSession({
      name: 'github-auth-session',
      keys: ['key1', 'key2']
    }));
    expressApp.use(passport.initialize());
    expressApp.use(passport.session());

    app.c('express').addRoute('github_err', 'get', '/auth/error', (req, res) => {
      res.send('Unknown Error');
    });

    // GET /auth/github
    //   Use passport.authenticate() as route middleware to authenticate the
    //   request.  The first step in GitHub authentication will involve
    //   redirecting the user to github.com.  After authorization, GitHub will
    //   redirect the user back to this application at /auth/github/callback.

    app.c('express').addMiddleware('github_auth', 'get', [
      passport.authenticate('github', { scope: [ 'user:email' ] }),
    ]);

    app.c('express').addRoute('github_auth', 'get', '/auth/github', (req, res) => {
      // The request will be redirected to GitHub for authentication, so this
      // function will not be called.
    });

    app.c('express').addMiddleware('github_auth_callback', 'get', [
      function(req, res, next) {
        const callback = passport.authenticate('github', {
          failureRedirect: '/auth/error',
        });
        try {
          callback(req, res, next);
        }
        catch(e) {
          res.send('An error occurred: ' + e);
        }
      }
      // passport.authenticate('github', { failureRedirect: '/auth/error' }),
    ]);

    app.c('express').addRoute('github_auth_callback', 'get', this.callbackPath(), (req, res) => {
      // We'll register the route here, but the middlewares, defined in run(),
      // actually calls the github callback.
      return res.redirect('/');
    });

  }
}

// $FlowExpectedError
module.exports = new LoginWithGitHub();
