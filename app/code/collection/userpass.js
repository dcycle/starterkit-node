/**
 * Message.
 */

(function () {
  'use strict';

  const mongoose = require('mongoose');

  // Set up the database for messages.
  const Message = mongoose.model('Message', {
    name : String,
    message : String,
  });

  module.exports = {
    model: function() {
      return Message;
    },
  };

}());
