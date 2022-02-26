/**
 * Get environment variables.
 */

(function () {
  'use strict';

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
