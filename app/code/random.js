/**
 * Generate random strings.
 */

(function () {
  'use strict';

  module.exports = {
    random: function(size = 32) {
      return require('crypto')
        .randomBytes(size)
        .toString('base64')
        .slice(0, size);
    },
  };

}());
