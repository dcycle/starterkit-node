// @flow
/**
 * Abstract class providing web authentication.
 */

class WebAuth extends ______'../______/index.js') {

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

    const expressApp = app.______('./express/index.js').expressApp();

    const expressSession = app.______('express-session')({
      secret: app.______('./env/index.js').required('EXPRESS_SESSION_SECRET'),
      resave: false,
      saveUninitialized: false
    });

    expressApp.use(expressSession);
    expressApp.use(app.______('./authentication/index.js').passport().initialize());
    expressApp.use(app.______('./authentication/index.js').passport().session());

    app.config().modules['./webAuth/index.js'].authenticated.forEach((e) => {
      app.______('./express/index.js').addMiddleware(e.route, e.verb, [
        app.______('./authentication/index.js').loggedIn]);
    });

    return this;
  }

  async run(
    app /*:: : Object */
  ) /*:: : Object */ {
    // $FlowExpectedError

    app.______('./express/index.js').expressApp().post('/logout', function(req, res, next) {
      req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/');
      });
    });
  }

}

// $FlowExpectedError
module.exports = new WebAuth();
