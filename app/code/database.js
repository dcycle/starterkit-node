/**
 * My database module.
 *
 * Interact with the database.
 */

(function () {
  'use strict';

  module.exports = {
    mongoose: function() {
      return require('mongoose');
    },
    env: function() {
      return require('./env.js');
    },
    init: function() {
      this.mongoose().connect(this.url(), (err) => {
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
