/**
 * Get environment variables.
 */

(function () {
  'use strict';

  module.exports = {
    required: function(name) {
      const candidate = process.env[name];
      if (typeof candidate === 'undefined') {
        throw Error('Environemnt variable ' + name + ' is required.');
      }
      return String(candidate);
    },
  };

}());
