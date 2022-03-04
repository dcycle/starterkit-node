/**
 * Authentication.
 */

(function () {
  'use strict';

  const env = require('./env.js');
  const secret = String(env.required('SESSION_SECRET'));
  const expressSession = require('express-session')({
    secret: secret,
    resave: false,
    saveUninitialized: false
  });

  module.exports = {
    expressSession: function() {
      return expressSession;
    },
  };

}());
