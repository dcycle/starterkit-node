/**
 * My database module.
 *
 * Interact with the database.
 */

(function () {
  'use strict';

  const mongoose = require('mongoose');
  const env = require('./env.js');

  const Database = {
    url: function() {
      return 'mongodb://'
        + String(env.required('MONGO_USER')) + ':'
        + String(env.required('MONGO_PASS')) + '@'
        + String(env.required('MONGO_HOST')) + ':'
        + String(env.required('MONGO_PORT')) + '/'
        + String(env.required('MONGO_DB')) + '?authSource=admin';
    },
  };

  exports.url = function () {
    return Database.url();
  }

}());
