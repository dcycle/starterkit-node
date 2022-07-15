// @flow
/**
 * Abstract class providing web authentication.
 */

class WebAuth extends require('../component/index.js') {

  dependencies() {
    return [
      './authentication/index.js',
    ];
  }

  expressApp.post('/logout', function(req, res, next) {
    req.logout(function(err) {
      if (err) { return next(err); }
      res.redirect('/');
    });
  });

}

// $FlowExpectedError
module.exports = new WebAuth();
