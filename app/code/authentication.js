/**
 * Authentication.
 *
 * Authenticate user sessions. See Resources in README.md.
 */

(function () {
  'use strict';

  const env = require('./env.js');

  module.exports = {
    init: function() {
      const secret = String(env.required('SESSION_SECRET'));

      return require('express-session')({
        secret: secret,
        resave: false,
        saveUninitialized: false
      });
    },
  };

}());
