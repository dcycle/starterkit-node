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
        + env.required('MONGO_USER') + ':'
        + env.required('MONGO_PASS') + '@' +
        + env.required('MONGO_HOST') + ':' +
        + env.required('MONGO_PORT') + '/' +
        + env.required('MONGO_DB') + '?authSource=admin';
    },
    init: function() {
      mongoose.connect(this.url(), (err) => {
        throw Error('Could not connect to database ' + err);
      });
    },
  };

  exports.init = function () {
    Database.init();
  }

}());
