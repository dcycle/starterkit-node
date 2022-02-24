/**
 * My database module.
 *
 * Interact with the database.
 */

(function () {
  'use strict';

  const mongoose = require('mongoose');
  const env = require('./env.js');

  const Env = {
    required: function(name) {
      const candidate = process.env[name];
      console.log(name);
      if (typeof candidate === 'undefined') {
        throw Error('Environemnt variable ' + name + ' is required.');
      }
      console.log(candidate);
      return String(candidate);
    },
  };

  exports.required = function (name) {
    return Env.required(name);
  }

}());
