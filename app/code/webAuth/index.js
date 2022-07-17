// @flow
/**
 * Abstract class providing web authentication.
 */

class WebAuth extends require('../component/index.js') {

  dependencies() {
    return [
      './authentication/index.js',
      './express/index.js',
    ];
  }

  async init(
    app /*:: : Object */
  ) /*:: : Object */ {
    this._app = app;

    app.config().modules['./webAuth/index.js'].authenticated.forEach((e) => {
      app.component('./express/index.js').addMiddleware('chat', [
        app.component('./authentication/index.js').loggedIn])
    });

    return this;
  }

  async run(
    app /*:: : Object */
  ) /*:: : Object */ {
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
