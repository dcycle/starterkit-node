/**
 * Reset the password for a user.
 */

(function () {
  'use strict';
  const env = require('../env.js');
  const random = require('../random.js');
  const database = require('../database.js');

  const username = String(env.required('MY_USERNAME'));
  const password = random.random();
}());
