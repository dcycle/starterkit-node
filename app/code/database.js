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
      const user = String(env.required('MONGO_USER'));
      const pass = String(env.required('MONGO_PASS'));
      const host = String(env.required('MONGO_HOST'));
      const port = String(env.required('MONGO_PORT'));
      const db = String(env.required('MONGO_DB'));

      return 'mongodb://' + user + ':' + pass + '@' + host + ':' + port + '/' + db + '?authSource=admin';
    },
  };

  exports.url = function () {
    return Database.url();
  };

}());
