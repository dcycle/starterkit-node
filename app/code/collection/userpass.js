/**
 * Message.
 */

(function () {
  'use strict';

  const mongoose = require('mongoose');
  const passportLocalMongoose = require('passport-local-mongoose');

  // Set up the database for usernames and hashed passwords.
  const Schema = mongoose.Schema;
  const UserDetail = new Schema({
    username: String,
    password: String
  });
  UserDetail.plugin(passportLocalMongoose);
  const UserDetails = mongoose.model('userInfo', UserDetail, 'userInfo');

  module.exports = {
    model: function() {
      return UserDetails;
    },
  };

}());
