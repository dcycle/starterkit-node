/**
 * Get environment variables.
 */

(function () {
  'use strict';

  module.exports = {
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

}());
