// @flow
/**
 * Abstract class providing web authentication.
 */

class WebAuth extends require('../component/index.js') {

  dependencies() {
    return [
      './authentication/index.js',
      './express/index.js',
      './env/index.js',
      'express-session',
    ];
  }

  async init(
    app /*:: : Object */
  ) /*:: : Object */ {
    this._app = app;

    const expressApp = app.component('./express/index.js').expressApp();

    const expressSession = app.component('express-session')({
      secret: app.component('./env/index.js').required('EXPRESS_SESSION_SECRET'),
      resave: false,
      saveUninitialized: false
    });

    expressApp.use(expressSession);
    expressApp.use(app.component('./authentication/index.js').passport().initialize());
    expressApp.use(app.component('./authentication/index.js').passport().session());

    this.addPathMiddlewaresFromConfig('authenticated', app.c('authentication').loggedIn);
    this.addPathMiddlewaresFromConfig('anonymous', function(req, res, next) {
      next();
    });
    this.addPathMiddlewaresFromConfig('authenticatedJson', function(req, res, next) {
      if (req.user) {
        next();
      } else {
        res.send(JSON.stringify({
          authentified: false,
          error: 'authentication failed; you need to be logged in to call this endpoint.',
        }));
      }
    });

    return this;
  }

  addPathMiddlewaresFromConfig(key, callback) {
    let paths = this._app.config().modules['./webAuth/index.js'][key];

    if (paths === null) {
      return;
    }
    if (typeof paths !== 'object') {
      return;
    }

    paths.forEach((e) => {
      this._app.component('./express/index.js').addMiddleware(e.route, e.verb, [
        callback,
      ]);
    });
  }

  async run(
    app /*:: : Object */
  ) /*:: : Object */ {
    // $FlowExpectedError

    app.component('./express/index.js').expressApp().post('/logout', function(req, res, next) {
      req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/');
      });
    });
  }

}

// $FlowExpectedError
module.exports = new WebAuth();
