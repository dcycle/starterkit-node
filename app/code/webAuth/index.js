// @flow
/**
 * Abstract class providing web authentication.
 */

class WebAuth extends require('../service/index.js') {

  dependencies() {
    return [
      'authentication',
      'express',
      'env',
    ];
  }

  async init(
    app /*:: : Object */
  ) /*:: : Object */ {
    this._app = app;

    const expressApp = app.service('express').expressApp();

    const expressSession = app.require('express-session')({
      secret: app.service('env').required('EXPRESS_SESSION_SECRET'),
      resave: false,
      saveUninitialized: false
    });

    expressApp.use(expressSession);
    expressApp.use(app.service('authentication').passport().initialize());
    expressApp.use(app.service('authentication').passport().session());

    // this.config('authenticated').forEach((e) => {
    //   app.service('express').addMiddleware(e.route, e.verb, [
    //     app.service('authentication').loggedIn]);
    // });

    return this;
  }

  async run(
    app /*:: : Object */
  ) /*:: : Object */ {
    // $FlowExpectedError

    app.service('express').expressApp().post('/logout', function(req, res, next) {
      req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/');
      });
    });
  }

}

// $FlowExpectedError
module.exports = new WebAuth();
