/**
 * My database module.
 *
 * Interact with the database.
 */

(function () {
  'use strict';

  const mongoose = require('mongoose');
  const env = require('./env.js');

  module.exports = {
    env: function() {
      return env;
    },
    init: function() {
      // See https://mongoosejs.com/docs/connections.html.
      mongoose.connect(this.url(), (err) => {
        console.log('mongodb connected',err);
      });
    },
    url: function() {
      const user = String(this.env().required('MONGO_USER'));
      const pass = String(this.env().required('MONGO_PASS'));
      const host = String(this.env().required('MONGO_HOST'));
      const port = String(this.env().required('MONGO_PORT'));
      const db = String(this.env().required('MONGO_DB'));

      return 'mongodb://' + user + ':' + pass + '@' + host + ':' + port + '/' + db + '?authSource=admin';
    },
  };

}());
